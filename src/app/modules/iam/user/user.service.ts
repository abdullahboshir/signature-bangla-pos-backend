import { startSession } from 'mongoose'
import type { ICustomer } from '../customer/customer.interface.js'
import type { IUser } from './user.interface.js'
import AppError from '../../errors/AppError.js'
import { genereteCustomerId } from './user.utils.js'
import { sendImageToCloudinary } from '../../utils/IMGUploader.js'
import config from '../../config/app.config.js'
import { USER_ROLE } from './user.constant.js'
import Customer from '../customer/customer.model.js'
import { User } from './user.model.js'
import { Role } from '../role/role.model.js'
import type { IVendorCore } from '../vendor/vendor-core/vendor-core.interface.js'
import { VendorCore } from '../vendor/vendor-core/vendor-core.model.js'
import type { IVendorContact } from '../vendor/vendor-shared/vendor-shared.interface.js'



export const getUsersService = async (): Promise<IUser[]> => {
  const users = await User.find().populate('roles').lean()
  return users
}


export const createCustomerService = async (
  customerData: ICustomer,
  password: string,
  file: Express.Multer.File | undefined,
) => {
  const session = await startSession()
  try {
    // Start transaction early to ensure abort/commit are valid
     session.startTransaction();

    // Check if user already exists
    const isUserExists = await User.findOne({ email: customerData.email }).session(session)
    
    if (isUserExists) {
      console.log('dddddddddddd', customerData.phone)
      throw new AppError(400, 'User with this email already exists!')
    }
    
    // Check if phone already exists (if provided)
    if (customerData.phone) {
      const phoneExists = await User.findOne({ phone: customerData.phone }).session(session)
      if (phoneExists) {
        throw new AppError(400, 'User with this phone number already exists!')
      }
    }
  
    // Get customer role
    const role = await Role.findOne({ name: USER_ROLE.CUSTOMER, isActive: true }).session(session)
    if (!role) {
      throw new AppError(404, 'Customer role not found!')
    }

    // Generate customer ID
    const id = await genereteCustomerId(customerData?.email, role._id.toString())

    // Handle file upload
    if (file) {
      try {
        const imgName = `${customerData?.name?.firstName || Date.now()}-${id}`
        const imgPath = file?.path
        const { secure_url } = (await sendImageToCloudinary(
          imgName,
          imgPath,
        )) as any
        customerData.avatar = secure_url
      } catch (uploadError: any) {
        console.error('Image upload failed:', uploadError)
        // Continue without avatar
      }
    }

    // Prepare user data
    const userData: Partial<IUser> = {
      id,
      email: customerData.email,
      password: password || (config.default_pass as string),
      roles: [role._id],
      departments: ['customer'],
      status: 'pending', 
      needsPasswordChange: !password,
      avatar: customerData.avatar as string,
    }

    if (customerData.phone) {
      userData.phone = customerData.phone
    }

    // Create User
    const newUser: any = await User.create([userData], { session })

    if (!newUser || !newUser.length) {
      throw new AppError(500, 'Failed to create user account!')
    }

        // Prepare customer data
    const customerPayload: ICustomer = {
      ...customerData,
      id,
      user: newUser[0]._id as any,
      email: customerData.email,
    }

    // Create Customer
    const newCustomer: any = await Customer.create([customerPayload], { session })

    if (!newCustomer || !newCustomer.length) {
      throw new AppError(500, 'Failed to create customer profile!')
    }

    // Commit transaction
    if (session.inTransaction()) {
      await session.commitTransaction();
    }
    
    console.log(`✅ Customer created successfully: ${newCustomer[0].email}`)
    
        // Return customer with populated user data
    const result = await Customer.findById(newCustomer[0]._id)
      .populate({
        path: 'user',
        select: '-password',
        populate: {
          path: 'roles',
          select: 'name description'
        }
      })
    
    return result
    
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error('❌ Customer creation failed:', error.message)
    
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError(500, `Failed to create customer: ${error.message}`)
  } finally {
    await session.endSession()
  }
}







export const createVendorService = async (
  vendorData: IVendorCore,
  password: string,
  file: Express.Multer.File | undefined,
) => {
  const session = await startSession()
  try {
    // Start transaction early to ensure abort/commit are valid
     session.startTransaction();

    // Check if user already exists
    const contact = vendorData.contact.email?  { email: vendorData.contact.email } : { primaryPhone: vendorData.contact.primaryPhone }
    const isUserExists = await User.findOne(contact).session(session)
    
    if (isUserExists) {
      throw new AppError(400, 'User with this Email/Phone already exists!')
    }
    
    
    // Get customer role
    const role = await Role.findOne({ name: USER_ROLE.VENDOR, isActive: true }).session(session)
    if (!role) {
      throw new AppError(404, 'Customer role not found!')
    }
    
    // Generate customer ID
    const id = await genereteCustomerId(vendorData?.contact.email, role._id.toString())
    
    // Handle file upload
    if (file) {
      try {
        const imgName = `${vendorData?.name?.firstName || Date.now()}-${id}`
        const imgPath = file?.path
        const { secure_url } = (await sendImageToCloudinary(
          imgName,
          imgPath,
        )) as any
        vendorData.avatar = secure_url
      } catch (uploadError: any) {
        console.error('Image upload failed:', uploadError)
        // Continue without avatar
      }
      console.log('dddddddddddd', id)
    }
    
    // Prepare user data
    const userData: Partial<IUser> = {
      id,
      email: vendorData.contact.email,
      password: password || (config.default_pass as string),
      roles: [role._id],
      departments: ['customer'],
      status: 'pending', 
      needsPasswordChange: !password,
      avatar: vendorData.avatar as string,
    }

    if (vendorData.contact.primaryPhone) {
      userData.phone = vendorData.contact.primaryPhone;
    }

    // Create User
    const newUser: any = await User.create([userData], { session })

    if (!newUser || !newUser.length) {
      throw new AppError(500, 'Failed to create user account!')
    }

        // Prepare customer data
    const vndorPayload: Partial<IVendorCore | IVendorContact> = {
      ...vendorData,
      id,
      user: newUser[0]._id as any,
      email: vendorData.contact.email,
    }

    // Create Customer
    const newVendor: any = await VendorCore.create([vndorPayload], { session })

    if (!newVendor || !newVendor.length) {
      throw new AppError(500, 'Failed to create customer profile!')
    }

    // Commit transaction
    if (session.inTransaction()) {
      await session.commitTransaction();
    }
    
    console.log(`✅ Customer created successfully: ${newVendor[0].contact.email}`)
    
        // Return customer with populated user data
    const result = await VendorCore.findById(newVendor[0]._id)
      .populate({
        path: 'user',
        select: '-password',
        populate: {
          path: 'roles',
          select: 'name description'
        }
      })
    
    return result
    
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error('❌ Customer creation failed:', error.message)
    
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError(500, `Failed to create customer: ${error.message}`)
  } finally {
    await session.endSession()
  }
}