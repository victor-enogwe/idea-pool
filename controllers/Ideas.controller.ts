import { model } from 'mongoose'
import { NotFound } from 'http-errors'
import { Request, Response, NextFunction } from 'express-serve-static-core'
import { Idea } from '../interfaces'

export class IdeaController {

  /**
   * Find Idea
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {(Promise<Response | void>)}
   * @memberof IdeaController
   */
  static async find (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    return model<Idea>('Idea').find().select('-updatedAt -authorId').skip((+(req.query.page || 1) - 1) * 10).limit(10)
      .then((ideas: Idea[]) => {
        if (!ideas.length) { throw new NotFound('ideas not found') }
        return res.status(200).json(ideas)
      }).catch(error => next(error))
  }

  /**
   * Create Idea
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {(Promise<Response | void>)}
   * @memberof IdeaController
   */
  static async create (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    return model<Idea>('Idea').insertMany([{ authorId: req.decoded.userId, ...req.body }])
      .then((ideas: Idea[]) => res.status(201).json(...ideas)).catch(error => next(error))
  }

  /**
   * Update Idea
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {(Promise<Response | void>)}
   * @memberof IdeaController
   */
  static async update (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    return model<Idea>('Idea').findOneAndUpdate({ _id: req.params.id, authorId: req.decoded.userId }, req.body, { new: true })
      .then((idea: Idea | null) => {
        if (!idea) { throw new NotFound('idea does not exist') }
        return res.status(200).json(idea)
      }).catch(error => next(error))
  }

  /**
   * Delete Idea
   *
   * @static
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {(Promise<Response | void>)}
   * @memberof IdeaController
   */
  static async delete (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    return model<Idea>('Idea').findOneAndDelete({ _id: req.params.id, authorId: req.decoded.userId })
      .then((idea: Idea | null) => {
        if (!idea) { throw new NotFound('idea does not exist') }
        return res.status(204).json(null)
      }).catch(error => next(error))
  }
}
