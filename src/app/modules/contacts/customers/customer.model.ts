import { model, Schema } from "mongoose";
import validator from "validator";
import type { ICustomer } from "./customer.interface.js";


const AddressSchema = new Schema({
  country: {
    type: String,
    required: true,
    default: "Bangladesh",
  },
  division: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  subDistrict: {
    type: String,
    required: true,
  },
  alliance: String,
  village: String,
  type: {
    type: String,
    enum: ["home", "work", "other"],
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const NameSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    maxlength: 50,
  },
  firstNameBangla: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  lastNameBangla: {
    type: String,
    trim: true,
    maxlength: 50,
  },
}, { _id: false });

const CustomerSchema = new Schema<ICustomer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: [true, "User id is required"],
    },
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "{VALUE} is not a valid email type",
      },
    },
    phone: {
      type: String,
      required: false,
      sparse: true,
      unique: true,
      index: true,
      trim: true,
      validate: {
        validator(value) {
          if (!value) return true; // Allow empty/undefined
          const phoneRegex = /^01\d{9}$/;
          return phoneRegex.test(value);
        },
        message:
          "Invalid phone number format. It must be 11 digits and start with 01.",
      },
    },

    name: NameSchema,
    avatar: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          if (!value) return true;
          return value < new Date();
        },
        message: "Date of birth must be in the past",
      },
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be either male, female, or other",
      },
      lowercase: true,
      trim: true,
    },
    preferences: {
      language: {
        type: String,
        enum: ["en", "bn"],
        default: "en",
      },
      addresses: [AddressSchema],
      currency: {
        type: String,
        enum: ["BDT", "USD"],
        default: "BDT",
      },
      newsletter: {
        type: Boolean,
        default: false,
      },
      smsNotifications: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: [0, "Loyalty points cannot be negative"],
    },
    membershipTier: {
      type: String,
      enum: {
        values: ["regular", "silver", "gold", "platinum"],
        message: "Membership tier must be regular, silver, gold, or platinum",
      },
      default: "regular",
      lowercase: true,
      trim: true,
    },
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    recentlyViewed: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        maxlength: 20, // Limit to 20 most recent items
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance 
CustomerSchema.index({ "name.firstName": 1, "name.lastName": 1 });
CustomerSchema.index({ createdAt: -1 }); // New Customers Report
CustomerSchema.index({ loyaltyPoints: -1 });
CustomerSchema.index({ membershipTier: 1 });

// Virtual for full name
CustomerSchema.virtual("fullName").get(function () {
  if (!this.name) return "";
  return `${this.name.firstName} ${this.name.lastName}`;
});

CustomerSchema.virtual("fullNameBangla").get(function () {
  if (!this.name) return "";
  return `${this.name.firstNameBangla || ""} ${this.name.lastNameBangla || ""}`.trim();
});

// Virtual for age
CustomerSchema.virtual("age").get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

const Customer = model<ICustomer>("Customer", CustomerSchema);

export default Customer;
