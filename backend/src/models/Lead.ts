import mongoose, { Document, Schema } from 'mongoose';

export type EmailDeliveryState =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'delayed'
  | 'failed'
  | 'bounced'
  | 'complained'
  | 'suppressed'
  | 'skipped';

export interface IEmailDelivery {
  adminStatus: EmailDeliveryState;
  visitorStatus: EmailDeliveryState;
  adminMessageId?: string;
  visitorMessageId?: string;
  adminError?: string;
  visitorError?: string;
  lastEvent?: string;
  lastEventAt?: Date;
}

export interface ILead extends Document {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  productName?: string;
  productCategory?: string;
  ipAddress?: string;
  userAgent?: string;
  submissionFingerprint?: string;
  emailDelivery: IEmailDelivery;
  status: 'new' | 'contacted' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
      maxlength: [150, 'Company cannot exceed 150 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      maxlength: [254, 'Email cannot exceed 254 characters'],
      match: [/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/, 'Invalid email address'],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      maxlength: [30, 'Phone cannot exceed 30 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    productName: {
      type: String,
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    productCategory: {
      type: String,
      trim: true,
      maxlength: [100, 'Product category cannot exceed 100 characters'],
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: [64, 'IP address cannot exceed 64 characters'],
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [512, 'User agent cannot exceed 512 characters'],
    },
    submissionFingerprint: {
      type: String,
      trim: true,
      index: true,
    },
    emailDelivery: {
      adminStatus: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'delayed', 'failed', 'bounced', 'complained', 'suppressed', 'skipped'],
        default: 'pending',
      },
      visitorStatus: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'delayed', 'failed', 'bounced', 'complained', 'suppressed', 'skipped'],
        default: 'pending',
      },
      adminMessageId: {
        type: String,
        trim: true,
      },
      visitorMessageId: {
        type: String,
        trim: true,
      },
      adminError: {
        type: String,
        trim: true,
        maxlength: [1000, 'Admin email error cannot exceed 1000 characters'],
      },
      visitorError: {
        type: String,
        trim: true,
        maxlength: [1000, 'Visitor email error cannot exceed 1000 characters'],
      },
      lastEvent: {
        type: String,
        trim: true,
        maxlength: [100, 'Email event cannot exceed 100 characters'],
      },
      lastEventAt: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'closed'],
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ submissionFingerprint: 1, createdAt: -1 });
LeadSchema.index({ 'emailDelivery.adminMessageId': 1 }, { sparse: true });
LeadSchema.index({ 'emailDelivery.visitorMessageId': 1 }, { sparse: true });

const Lead = mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
