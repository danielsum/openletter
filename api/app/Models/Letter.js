'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Letter extends Model {

  static boot () {
    super.boot()
    this.addTrait('Slugify')
    /**
     * A hook to hash the signature password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (letterInstance) => {
      if (letterInstance.dirty.password) {
        letterInstance.password = await Hash.make(letterInstance.password)
      }
    })
  }

  static get hidden() {
    return ['updated_at'];
  }

  signatures() {
      return this.hasMany('App/Models/Signature', 'id', 'letter_id');
    }
}

module.exports = Letter
