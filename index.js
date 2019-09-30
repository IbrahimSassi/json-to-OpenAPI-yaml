const DATA = require('./swagger.json');
const _ = require('lodash');
const YAML = require('json2yaml');

const createRef = name => `#/definitions/${name}`;
const isNested = token => ['object', 'array'].includes(token.type);
const isPrimitive = token => !isNested(token);
const definitions = {};
const getType = (field, currentPath) => {
    switch (true) {
        case typeof field === 'string':
            return { type: 'string' };
        case typeof field === 'number':
            return { type: 'integer' };
        case typeof field === 'boolean':
            return { type: 'boolean' };
        case _.isArray(field):
            const first = _.head(field);
            if (typeof first === 'string')
                return {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                };
            else
                return {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: goDeep(first, currentPath)
                    }
                };
        case _.isObject(field):
            if (field._ref) {
                const refKey = field._ref;
                if (!definitions[refKey]) {
                    delete field._ref;
                    definitions[refKey] = goDeep(field, currentPath);
                }

                return { $ref: createRef(refKey) };
            }
            return {
                type: 'object',
                properties: goDeep(field, currentPath)
            };
        default:
            throw new Error(`Unknown type for ${currentPath}`);
    }
};
const goDeep = (data, path = '') =>
    _(data)
        .keys()
        .reduce(function iterate(acc, key) {
            const currentPath = path ? path + '.' + key : key;
            const field = _.get(data, key);
            const type = getType(field, currentPath);
            _.set(acc, key, type);

            return acc;
        }, {});

const schema = goDeep(DATA, '');
// console.log(JSON.stringify({ schema }, null, ' '));
console.log(YAML.stringify({ schema, definitions }));
