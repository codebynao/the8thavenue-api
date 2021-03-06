import CategoryModel from '../models/Category'
import { FastifyRequest, FastifyReply } from 'fastify'
import httpErrors from 'http-errors'
import { ILabel } from '../interfaces/category'

/**
 * TYPES
 */
type ExtendedFastifyRequest = FastifyRequest<{
  Params: {
    id: string
  }
  Body: {
    _id: string
    slug: string
    isActivated: boolean
    labels: Array<Object>
  }
}>

type QueryFastifyRequest = FastifyRequest<{
  Querystring: {
    locale: string
  }
}>

/**
 * CONTROLLER
 */
const getAll = async (request: QueryFastifyRequest, reply: FastifyReply) => {
  try {
    const categories = await CategoryModel.find({}, 'slug isActivated labels').lean()
    const locale = request.query.locale || 'en'
    for (const category of categories) {
      const label = category.labels.find((item: ILabel) => item.locale === locale)
      if (label) {
        category.name = label.value
      }
    }

    reply.send(categories)
  } catch (error) {
    reply.log.error('error getAll categories: ', error)
    reply.send(httpErrors(500, error.message))
  }
}

const add = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const createdCategory = await CategoryModel.create(request.body)
    reply.send({
      _id: createdCategory._id,
      slug: createdCategory.slug,
      isActivated: createdCategory.isActivated,
      labels: createdCategory.labels
    })
  } catch (error) {
    reply.log.error('error add category: ', error)
    reply.send(httpErrors(500, error.message))
  }
}

const update = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const category = await CategoryModel.findById(
      request.params.id,
      'slug isActivated labels'
    )
    if (!category) {
      return reply.send(httpErrors(404, 'Category not found'))
    }

    category.slug = request.body.slug
    category.isActivated = request.body.isActivated
    category.labels = request.body.labels

    await category.save()

    reply.send(category)
  } catch (error) {
    reply.log.error('error update category: ', error)
    reply.send(httpErrors(500, error.message))
  }
}

const remove = async (request: ExtendedFastifyRequest, reply: FastifyReply) => {
  try {
    const category = await CategoryModel.findById(request.params.id).lean()
    if (!category) {
      return reply.send(httpErrors(404, 'Category not found'))
    }
    await CategoryModel.deleteOne({ _id: request.params.id })
    reply.send(true)
  } catch (error) {
    reply.log.error('error delete category: ', error)
    reply.send(httpErrors(500, error.message))
  }
}
export default {
  add,
  getAll,
  update,
  remove
}
