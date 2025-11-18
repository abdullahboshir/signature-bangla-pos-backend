import { Product } from "./product-core.model.js"


// 🔍 1. Find the last product by category, origin, and date
export const findLastProduct = async (
  categoryCode: string,
  originCode: string,
  dateCode: string
): Promise<string | undefined> => {
  try {
    const regexPattern = new RegExp(
      `^${categoryCode}-${originCode}-${dateCode}-\\d{5}$`,
      'i'
    )

    const lastProduct = await Product.findOne({
      sku: { $regex: regexPattern }
    })
      .sort({ createdAt: -1 })
      .lean()

    return typeof lastProduct?.sku === 'string' ? lastProduct.sku : undefined
  } catch (error) {
    console.error('❌ Error finding last product:', error)
    return undefined
  }
}

// 🔢 2. Generate the next increment (5 digits)
export const generateIncrement = (lastCode: string | undefined): string => {
  try {
    let newIncrement = '00001'

    if (lastCode) {
      const match = lastCode.match(/-(\d{5})$/)
      if (match && match[1]) {
        const lastNumber = parseInt(match[1], 10)
        newIncrement = String(lastNumber + 1).padStart(5, '0')
      }
    }

    return newIncrement
  } catch (error) {
    console.error('❌ Error generating increment:', error)
    return '00001'
  }
}

// 🧪 3. Generate the SKU using CATEGORY-ORIGIN-DATE-INCREMENT
export const generateProductCode = async (
  category: string,
  origin: string
): Promise<string> => {
  const categoryCode = category.trim().toUpperCase()
  const originCode = origin.trim().toUpperCase()

  const now = new Date()
  const yy = now.getFullYear().toString().slice(-2)
  const mm = (now.getMonth() + 1).toString().padStart(2, '0')
  const dd = now.getDate().toString().padStart(2, '0')
  const dateCode = `${yy}${mm}${dd}`

  const lastCode = await findLastProduct(categoryCode, originCode, dateCode)
  const increment = generateIncrement(lastCode)

  const sku = `${categoryCode}-${originCode}-${dateCode}-${increment}`
  console.log('✅ Generated SKU:', sku)

  return sku
}
