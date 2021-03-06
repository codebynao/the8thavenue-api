import { model, Schema } from 'mongoose'
import { ICategory } from '../interfaces/category'

const CategorySchema: Schema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    isActivated: { type: Boolean, default: true },
    labels: {
      type: [{
        locale: String,
        value: String
      }]
    }
  },
  {
    timestamps: true
  }
)

export default model<ICategory>('Category', CategorySchema)
