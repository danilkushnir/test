using my.bookshop as db from '../db/schema';
service CatalogService @(path: '/odata/v4/catalog') {
  entity Books as projection on db.Books actions {
    action restock(quantity: Integer) returns Books;
  };
}
