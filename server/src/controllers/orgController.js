import { Organization } from '../models/Organization.js';
import { Membership } from '../models/Membership.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';


//Slug Generator function to create a unique slug for each organization based on its name and current timestamp
const generateSlug = (name) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${Date.now().toString().slice(-5)}`;
};

export const createOrganization = asyncHandler(async (req,res) => {
    const {name} = req.body;

    if(!name || name.trim() === ''){
        throw new ApiError(400,'Organization name is required');
    }

    const slug = generateSlug(name);

    const organization = await Organization.create({
        name:name.trim(),
        slug,
        ownerId:req.user._id,
    })

    await Membership.create({
        userId:req.user._id,
        orgId:organization._id,
        role:'owner',
    })

    res.status(201).json({
        success:true,
        message:'Organization created successfully',
        data:organization,
    })
})

export const getMyOrganizations = asyncHandler(async (req, res) => {
  const memberships = await Membership.find({ userId: req.user._id })
    .populate({
      path: 'orgId',
      model: Organization, // Explicitly model pass kar do taaki population 100% guarantee ho
      select: 'name slug createdAt ownerId',
    })
    .lean();

  const orgs = memberships.map((m) => ({
    organization: m.orgId,
    role: m.role,
    joinedAt: m.createdAt,
  }));

  res.status(200).json({
    success: true,
    count: orgs.length,
    data: orgs,
  });
});


export const addMemberToOrganization = asyncHandler(async (req,res) =>{
    const {orgId} = req.params;
    const {email, role = 'member'} = req.body;

    if(!email){
        throw new ApiError(400, 'User email is required to add member');
    }

    const org = await Organization.findById(orgId);

    if(!org){
        throw new ApiError(404, 'Organization not found');
    }

    const requesterMembership = await Membership.findOne({
        userId: req.user._id,
        orgId: org._id,
    })

    if (!requesterMembership || !['owner', 'admin'].includes(requesterMembership.role)) {
    throw new ApiError(403, 'You do not have permission to add members to this organization');
  }

  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    throw new ApiError(404, 'No user found with this email. Ask them to register first.');
  }

  const existingMembership = await Membership.findOne({
    userId: userToAdd._id,
    orgId,
  });

  if (existingMembership) {
    throw new ApiError(409, 'User is already a member of this organization');
  }

  const newMembership = await Membership.create({
    userId: userToAdd._id,
    orgId,
    role,
  });

  res.status(201).json({
    success: true,
    message: `User added to organization as ${role}`,
    data: newMembership,
  });


})