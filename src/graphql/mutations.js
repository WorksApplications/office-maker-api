// eslint-disable
// this is an auto generated file. This will be overwritten

export const addEditObject = `mutation AddEditObject(
  $floorId: String!
  $backgroundColor: String
  $changed: Boolean
  $deleted: Boolean
  $width: Int
  $height: Int
  $x: Int
  $y: Int
  $name: String
  $personId: String
  $fontSize: Int
  $type: String
  $url: String
) {
  addEditObject(
    floorId: $floorId
    backgroundColor: $backgroundColor
    changed: $changed
    deleted: $deleted
    width: $width
    height: $height
    x: $x
    y: $y
    name: $name
    personId: $personId
    fontSize: $fontSize
    type: $type
    url: $url
  ) {
    backgroundColor
    changed
    deleted
    floorId
    height
    id
    updateAt
    width
    x
    y
    name
    personId
    fontSize
    type
    url
  }
}
`;
export const updateEditObject = `mutation UpdateEditObject(
  $floorId: String!
  $id: String!
  $backgroundColor: String
  $changed: Boolean
  $deleted: Boolean
  $width: Int
  $height: Int
  $x: Int
  $y: Int
  $name: String
  $personId: String
  $fontSize: Int
  $type: String
  $url: String
) {
  updateEditObject(
    floorId: $floorId
    id: $id
    backgroundColor: $backgroundColor
    changed: $changed
    deleted: $deleted
    width: $width
    height: $height
    x: $x
    y: $y
    name: $name
    personId: $personId
    fontSize: $fontSize
    type: $type
    url: $url
  ) {
    backgroundColor
    changed
    deleted
    floorId
    height
    id
    updateAt
    width
    x
    y
    name
    personId
    fontSize
    type
    url
  }
}
`;
export const deleteEditObject = `mutation DeleteEditObject($floorId: String!, $id: String!) {
  deleteEditObject(floorId: $floorId, id: $id) {
    backgroundColor
    changed
    deleted
    floorId
    height
    id
    updateAt
    width
    x
    y
    name
    personId
    fontSize
    type
    url
  }
}
`;
