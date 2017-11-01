module.exports = function(event) {
  const prefix = process.env.TABLE_PREFIX;

  if (!prefix && prefix !== '') {
    throw 'process.env.TABLE_PREFIX not found.';
  }
  
  return {
    editFloors: `${prefix}office_maker_map_edit_floors`,
    publicFloors: `${prefix}office_maker_map_public_floors`,
    editObjects: `${prefix}office_maker_map_edit_objects`,
    publicObjects: `${prefix}office_maker_map_public_objects`,
    // master
    prototypes: `${prefix}office_maker_map_prototypes`,
    colors: `${prefix}office_maker_map_colors`,
  };
};
