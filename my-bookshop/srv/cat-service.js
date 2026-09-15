const cds = require('@sap/cds')
module.exports = class CatalogService extends cds.ApplicationService {
  async init() {
    const { Books } = this.entities
    this.on('restock', Books, async (req) => {
      const { quantity } = req.data
      const id = req.params[0]?.ID
      if (!quantity || quantity < 1) {
        return req.error(400, 'Quantity must be at least 1')
      }
      await UPDATE(Books).set({ stock: quantity }).where({ ID: id })
      return SELECT.one(Books).where({ ID: id })
    })

    await super.init()
  }
}