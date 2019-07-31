import * as devkit from 'swagger-devkit';

const swagger = new devkit.Swagger();

swagger.addInfo({
  title: 'office-maker-api',
  description: 'Not completed yet',
  version: '1.0.0'
});

const floorProperty = {
  flipImage: devkit.Schema.boolean(),
  height: devkit.Schema.int32(),
  id: devkit.Schema.string({ format: 'uuid' }),
  image: devkit.Schema.string({ format: 'uuid' }),
  name: devkit.Schema.string(),
  ord: devkit.Schema.int32(),
  realHeight: devkit.Schema.int32(),
  realWidth: devkit.Schema.int32(),
  temporary: devkit.Schema.boolean(),
  tenantId: devkit.Schema.string(),
  updateAt: devkit.Schema.int64({
    format: 'timestamp',
    description: 'timestamp in milliseconds'
  }),
  updateBy: devkit.Schema.string(),
  width: devkit.Schema.int32()
};

const Floor = new devkit.Component(
  swagger,
  'Floor',
  devkit.Schema.object(floorProperty)
);

const Floors = new devkit.Component(
  swagger,
  'Floors',
  devkit.Schema.array(
    devkit.Schema.array(
      Floor // this is nullable
    )
  )
);

const objectBasicProperty = {
  id: devkit.Schema.string({ format: 'uuid' }),
  floorId: devkit.Schema.string({ format: 'uuid' }),
  changed: devkit.Schema.boolean(),
  deleted: devkit.Schema.boolean({
    description: 'A deleted object will not be shown in getFloor'
  }),
  updateAt: devkit.Schema.int64({
    format: 'timestamp',
    description: 'timestamp in milliseconds'
  }),
  x: devkit.Schema.int32(),
  y: devkit.Schema.int32(),
  backgroundColor: devkit.Schema.string({
    format: 'color-code',
    example: '#eee'
  }),
  height: devkit.Schema.int32(),
  width: devkit.Schema.int32(),
  name: devkit.Schema.string()
};

const personProperty = {
  personId: devkit.Schema.string()
};

const deskProperty = {
  color: devkit.Schema.string(),
  bold: devkit.Schema.boolean(),
  url: devkit.Schema.string(),
  shape: devkit.Schema.string({
    enum: ['rectangle', 'ellipse']
  })
};

const PersonObject = new devkit.Component(
  swagger,
  'PersonObject',
  devkit.Schema.object(
    Object.assign(
      // hack for shallow-copy
      JSON.parse(JSON.stringify(objectBasicProperty)),
      personProperty
    )
  )
);
const DeskObject = new devkit.Component(
  swagger,
  'DeskObject',
  devkit.Schema.object(
    Object.assign(JSON.parse(JSON.stringify(objectBasicProperty)), deskProperty)
  )
);

const ObjectComponent = new devkit.Component(swagger, 'Object', {
  oneOf: [PersonObject, DeskObject],
  example: {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    floorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    changed: true,
    deleted: true,
    updateAt: 0,
    x: 0,
    y: 0,
    backgroundColor: '#eee',
    height: 0,
    width: 0,
    name: 'string',
    color: 'string',
    bold: true,
    url: 'string',
    shape: 'rectangle'
  }
});

const Objects = new devkit.Component(
  swagger,
  'Objects',
  devkit.Schema.array(ObjectComponent)
);

swagger.addPath(
  '/floors',
  'get',
  new devkit.Path({
    summary: 'Get floors',
    operationId: 'getFloors',
    tags: ['floor'],
    description:
      'Listing all floors. If the user has edit floors, this will also returns those floors.'
  }).addResponse(
    '200',
    new devkit.Response({
      description: 'Returns floors'
    }).addContent('application/json', Floors)
  )
);

const floorId = {
  name: 'floorId',
  in: 'path',
  description: 'floorId',
  required: true,
  schema: devkit.Schema.string({ format: 'uuid' })
};

swagger.addPath(
  '/floors/{floorId}/public',
  'put',
  new devkit.Path({
    summary: 'Publish a floor',
    operationId: 'putFloorsFloorIdPublic',
    tags: ['floor'],
    parameters: [floorId]
  }).addResponse(
    '200',
    new devkit.Response({
      description: 'Returns the newly published floor and the objects'
    }).addContent(
      'application/json',
      devkit.Schema.object(
        Object.assign(JSON.parse(JSON.stringify(floorProperty)), {
          objects: Objects
        })
      )
    )
  )
);

swagger.addPath(
  '/floors/{floorId}/edit',
  'delete',
  new devkit.Path({
    summary: 'Delete an edit floor',
    operationId: 'deleteFloorsFloorIdEdit',
    tags: ['floor'],
    parameters: [floorId]
  }).addResponse('200', {
    description: 'Returns nothing'
  })
);

swagger.addPath(
  '/floors/{floorId}/edit',
  'put',
  new devkit.Path({
    summary: 'Update an edit floor',
    operationId: 'putFloorsFloorIdEdit',
    tags: ['floor'],
    parameters: [floorId],
    deprecated: true
  }).addResponse(
    '200',
    new devkit.Response({
      description: 'Returns the edit floor and the objects'
    }).addContent(
      'application/json',
      devkit.Schema.object(
        Object.assign(JSON.parse(JSON.stringify(floorProperty)), {
          objects: Objects
        })
      )
    )
  )
);

swagger.addPath(
  '/floors/{floorId}/edit',
  'get',
  new devkit.Path({
    summary: 'Get an edit floor',
    operationId: 'getFloorsFloorIdEdit',
    tags: ['floor'],
    parameters: [floorId]
  }).addResponse(
    '200',
    new devkit.Response({
      description: 'Returns the edit floor and the objects'
    }).addContent(
      'application/json',
      devkit.Schema.object(
        Object.assign(JSON.parse(JSON.stringify(floorProperty)), {
          objects: devkit.Schema.array(ObjectComponent, {
            example: [],
            description:
              '(Property for backward compatibility) This is always empty. Call AppSync API for fetching objects on an edit floor.'
          })
        })
      )
    )
  )
);

const objectId = {
  name: 'objectId',
  in: 'path',
  description: 'objectId',
  required: true,
  schema: devkit.Schema.string({ format: 'uuid' })
};

const ObjectModification = new devkit.Component(
  swagger,
  'ObjectModification',
  devkit.Schema.array(
    devkit.Schema.object({
      flag: {
        type: 'string',
        enum: ['added', 'modified', 'deleted']
      },
      result: {
        type: 'string',
        enum: ['success']
      },
      object: ObjectComponent
    })
  )
);

swagger.addPath(
  '/objects',
  'patch',
  new devkit.Path({
    summary: 'Update objects',
    operationId: 'patchObjects2',
    tags: ['object'],
    deprecated: true
  })
    .addRequestBody(
      new devkit.RequestBody().addContent(
        'application/json',
        ObjectModification
      )
    )
    .addResponse(
      '200',
      new devkit.Response({
        description: 'Returns object modifications'
      }).addContent('application/json', ObjectModification)
    )
);

swagger.addPath(
  '/objects/{objectId}',
  'get',
  new devkit.Path({
    summary: 'Get an object',
    operationId: 'getObjectsObjectId',
    tags: ['object'],
    parameters: [objectId]
  }).addResponse(
    '200',
    new devkit.Response({
      description: 'Returns the object'
    }).addContent('application/json', ObjectComponent)
  )
);

swagger.addPath(
  '/people',
  'get',
  new devkit.Path({
    operationId: 'getPeople',
    tags: ['people']
  }).addResponse('200', {
    description: 'Not documented yet'
  })
);

const query = {
  name: 'query',
  in: 'path',
  description: 'search query',
  required: true,
  schema: devkit.Schema.string()
};

swagger.addPath(
  '/search/{query}',
  'get',
  new devkit.Path({
    operationId: 'getSearchQuery',
    tags: ['search'],
    parameters: [query]
  }).addResponse('200', {
    description: 'Not documented yet'
  })
);

swagger.addPath(
  '/search/Objects/{query}',
  'get',
  new devkit.Path({
    operationId: 'getSearchObjectsQuery',
    tags: ['search'],
    parameters: [query]
  }).addResponse('200', {
    description: 'Not documented yet'
  })
);

swagger.addPath(
  '/self',
  'get',
  new devkit.Path({
    operationId: 'getSelf',
    tags: ['self'],
    deprecated: true,
    description: 'This was used for decoding JWT and fetching the profile.'
  }).addResponse('200', {
    description: 'Not documented yet'
  })
);

const Color = new devkit.Component(
  swagger,
  'Color',
  devkit.Schema.object({
    color: devkit.Schema.string({ format: 'color-code' }),
    id: devkit.Schema.string({ format: 'int32', description: 'Not sure(?)' }),
    ord: devkit.Schema.int32(),
    tenantId: devkit.Schema.string(),
    type: devkit.Schema.string({ example: 'color' })
  })
);

const Colors = new devkit.Component(
  swagger,
  'Colors',
  devkit.Schema.array(Color)
);

swagger.addPath(
  '/colors',
  'get',
  new devkit.Path({
    operationId: 'getColors',
    tags: ['color']
  }).addResponse(
    '200',
    new devkit.Response({
      description: 'Returns the colors'
    }).addContent('application/json', Colors)
  )
);

swagger.addPath(
  '/colors',
  'put',
  new devkit.Path({
    operationId: 'putColors',
    tags: ['color']
  }).addResponse('200', {
    description: 'Not documented yet'
  })
);

swagger.addPath(
  '/colors/{id}',
  'put',
  new devkit.Path({
    operationId: 'putColorById',
    tags: ['color'],
    parameters: [
      {
        name: 'id',
        in: 'path',
        description: 'id',
        required: true,
        schema: devkit.Schema.string()
      }
    ]
  }).addResponse('200', {
    description: 'Not documented yet'
  })
);

const Prototype = new devkit.Component(
  swagger,
  'Prototype',
  devkit.Schema.object({
    backgroundColor: devkit.Schema.string({ format: 'color-code' }),
    color: devkit.Schema.string({
      format: 'color-code',
      description: 'nullable'
    }),
    fontSize: devkit.Schema.int32({ description: 'nullable' }),
    height: devkit.Schema.int32({ description: 'nullable' }),
    id: devkit.Schema.string({ format: 'uuid' }),
    name: devkit.Schema.string(),
    shape: devkit.Schema.string({ description: 'nullable' }),
    tenantId: devkit.Schema.string(),
    width: devkit.Schema.int32()
  })
);

const Prototypes = new devkit.Component(
  swagger,
  'Prototypes',
  devkit.Schema.array(Prototype)
);

swagger.addPath(
  '/prototypes',
  'get',
  new devkit.Path({
    summary: 'List prototypes',
    operationId: 'getPrototypes',
    tags: ['prototype']
  }).addResponse(
    '200',
    new devkit.Response({
      description: 'Returns prototypes'
    }).addContent('application/json', Prototypes)
  )
);

swagger.addPath(
  '/prototypes',
  'put',
  new devkit.Path({
    operationId: 'putPrototypes',
    tags: ['prototype']
  }).addResponse('200', {
    description: 'Not documented yet'
  })
);

swagger.addPath(
  '/prototypes/{prototypeId}',
  'put',
  new devkit.Path({
    summary: 'Update a prototype',
    operationId: 'putPrototypesPrototypeId',
    tags: ['prototype'],
    parameters: [
      {
        name: 'prototypeId',
        in: 'path',
        description: 'prototypeId',
        required: true,
        schema: devkit.Schema.string()
      }
    ]
  })
    .addParameter({
      name: 'prototypeId',
      in: 'path',
      required: true,
      schema: devkit.Schema.string({ format: 'uuid' })
    })
    .addRequestBody(
      new devkit.RequestBody().addContent('application/json', ObjectComponent)
    )
    .addResponse(
      '200',
      new devkit.Response({
        description: 'Returns nothing?'
      }).addContent('application/json', devkit.Schema.object({}))
    )
);

swagger.addPath(
  '/images/{imageId}',
  'put',
  new devkit.Path({
    operationId: 'putImagesImageId',
    tags: ['image'],
    parameters: [
      {
        name: 'imageId',
        in: 'path',
        description: 'imageId',
        required: true,
        schema: devkit.Schema.string()
      }
    ]
  }).addResponse('200', {
    description: 'Not documented yet'
  })
);

swagger.run();
