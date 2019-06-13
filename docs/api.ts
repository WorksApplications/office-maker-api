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

const objectProperty = {
  backgroundColor: devkit.Schema.string({
    format: 'color-code',
    example: '#eee'
  }),
  floorId: devkit.Schema.string({ format: 'uuid' }),
  height: devkit.Schema.int32(),
  id: devkit.Schema.string({ format: 'uuid' }),
  updateAt: devkit.Schema.int64({
    format: 'timestamp',
    description: 'timestamp in milliseconds'
  }),
  width: devkit.Schema.int32(),
  x: devkit.Schema.int32(),
  y: devkit.Schema.int32()
};

const ObjectComponent = new devkit.Component(
  swagger,
  'Object',
  devkit.Schema.object(objectProperty)
);

const Objects = new devkit.Component(
  swagger,
  'Objects',
  devkit.Schema.array(ObjectComponent)
);

const FloorAndObjects = new devkit.Component(
  swagger,
  'FloorAndObjects',
  devkit.Schema.object(
    Object.assign(floorProperty, {
      objects: devkit.Schema.array(devkit.Schema.object(objectProperty))
    })
  )
);

swagger.addPath(
  '/floors',
  'get',
  new devkit.Path({
    summary: 'Get floors',
    operationId: 'getFloors',
    tags: ['floor']
  }).addResponse(
    '200',
    new devkit.Response({
      description: 'Returns floors'
    }).addContent('application/json', Floors)
  )
);

const floorId = {
  name: 'floorId',
  in: 'query',
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
    }).addContent('application/json', FloorAndObjects)
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
    parameters: [floorId]
  }).addResponse(
    '200',
    new devkit.Response({
      description: 'Returns the edit floor and the objects'
    }).addContent('application/json', FloorAndObjects)
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
    }).addContent('application/json', FloorAndObjects)
  )
);

const objectId = {
  name: 'objectId',
  in: 'query',
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
      object: devkit.Schema.object(objectProperty)
    })
  )
);

swagger.addPath(
  '/objects',
  'patch',
  new devkit.Path({
    summary: 'Update objects',
    operationId: 'patchObjects2',
    tags: ['object']
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
    }).addContent('application/json', Objects)
  )
);

swagger.addPath(
  '/people',
  'get',
  new devkit.Path({
    operationId: 'getPeople',
    tags: ['people']
  })
);

swagger.addPath(
  '/search/{query}',
  'get',
  new devkit.Path({
    operationId: 'getSearchQuery',
    tags: ['search']
  })
);

swagger.addPath(
  '/search/Objects/{query}',
  'get',
  new devkit.Path({
    operationId: 'getSearchObjectsQuery',
    tags: ['search']
  })
);

swagger.addPath(
  '/self',
  'get',
  new devkit.Path({
    operationId: 'getSelf',
    tags: ['self']
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
  })
);

swagger.addPath(
  '/colors/{id}',
  'put',
  new devkit.Path({
    operationId: 'putColorById',
    tags: ['color']
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
  })
);

swagger.addPath(
  '/prototypes/{prototypeId}',
  'put',
  new devkit.Path({
    summary: 'Update a prototype',
    operationId: 'putPrototypesPrototypeId',
    tags: ['prototype']
  })
    .addParameter({
      name: 'prototypeId',
      in: 'query',
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
    tags: ['image']
  })
);

swagger.run();
