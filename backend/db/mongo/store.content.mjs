'use strict'

import { modelToObject, modelToArrayObject } from './db.handler.mjs'

/**
 * 各種コンテンツのDB操作定義クラス
 */
export default class ContentStore {
  Model

  constructor(model) {
    this.Model = model
  }

  /**
   * Content情報リスト取得
   * @param {object} filter ユーザIDなど絞り込み条件
   * @param {object} select 取得フィールド
   * @param {object} sort sort条件
   * @param {number} skip offset 0 以下の時は無視される
   * @param {number} limit limit 0 以下の時は無視される
   */
  async getContents(filter = {}, select = { _id: 0 }, sort = { id: 1 }, skip = 0, limit = 0) {
    const sFilter = { ...filter, removed: false }
    const sSort = { position: 1, ...sort }
    let query = this.Model.find(sFilter).select(select).sort(sSort)
    if (skip && skip > 0) query = query.skip(skip)
    if (limit && limit > 0) query = query.limit(limit)

    return modelToArrayObject(await query.exec())
  }

  /**
   * Content情報取得
   * @param {number} id 取得対象ID
   * @param {object} select 取得フィールド
   */
  async getContent(id, select = { _id: 0 }) {
    const content = await this.Model.findOne({ id, removed: false }, select).exec()
    return modelToObject(content)
  }

  /**
   * Content追加
   * @param {object} content 情報
   */
   async createContent(content) {
    const contentModel = new this.Model(content)
    return modelToObject(await contentModel.save())
  }

  /**
   * Content更新
   * @param {number} 更新対象 content id
   * @param {object} content 情報
   */
   async updateContent(id, content) {
    const contentModel = await this.Model.findOne({ id }).exec()
    if (!contentModel) return null

    Object.assign(contentModel, content, { removed: false })
    return modelToObject(await contentModel.save())
  }

  /**
   * Content 物理削除
   * @param {number} id 削除対象id
   */
   async deleteContent(id) {
     return await this.Model.deleteOne({ id }).exec()
   }

  /**
   * Content 論理削除 削除フラグ設定
   * @param {number} 論理削除対象 content id
   */
   async logicalDeleteContent(id) {
    const contentModel = await this.Model.findOne({ id }).exec()
    if (!contentModel) return null

    contentModel.removed = true
    return modelToObject(await contentModel.save())
  }

  /**
   * Content リスト Position 更新
   * @param {Array} content リスト Position 情報
   */
  async updateContentPositions(positions) {
    const promises = positions.map((p) => (
      this.Model.findOneAndUpdate({ id: p.id }, { position: p.position }, { new: true })
    ))
    return modelToArrayObject(await Promise.all(promises))
  }
}
