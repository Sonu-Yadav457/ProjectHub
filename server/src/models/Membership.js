import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: {
        values: ['owner', 'admin', 'member', 'viewer'],
        message: '{VALUE} is not a supported role',
      },
      default: 'member',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate membership records for the same user in the same org
membershipSchema.index({ userId: 1, orgId: 1 }, { unique: true });

export const Membership = mongoose.model('Membership', membershipSchema);