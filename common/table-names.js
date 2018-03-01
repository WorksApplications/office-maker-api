module.exports = function(event) {
  const prefix = process.env.TABLE_PREFIX;

  if (!prefix && prefix !== '') {
    throw 'process.env.TABLE_PREFIX not found.';
  }

  return {
    colors: `${prefix}_colors`,
    prototypes: `${prefix}_prototypes`,
    publicFloors: `${prefix}_public_floors`,
    editFloors: `${prefix}_edit_floors`,
    publicObjects: `${prefix}_public_objects`,
    editObjects: `${prefix}_edit_objects`,
  };
};
