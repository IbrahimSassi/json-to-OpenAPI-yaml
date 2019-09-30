const DATA = require('./swagger.json');
const _ = require('lodash');
const YAML = require('json2yaml');

const createRef = name => `#/definitions/${name}`;
const isNested = token => ['object', 'array'].includes(token.type);

const goDeep = (data, path = 'schema') =>
    _(data)
        .keys()
        .map(function iterate(key) {
            console.log(path + '.' + key);
            // console.log(key);
            const field = _.get(data, key);
            switch (true) {
                case typeof field === 'string':
                    return { [key]: { type: 'string' } };
                case typeof field === 'number':
                    return { [key]: { type: 'integer' } };
                case typeof field === 'boolean':
                    return { [key]: { type: 'boolean' } };
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
                                properties: goDeep(first, path + '.' + key)
                            }
                        };
                case _.isObject(field):
                    return {
                        type: 'object',
                        properties: goDeep(field, path + '.' + key)
                    };
                default:
                    throw new Error(`Unknown type for ${key}`);
            }
        })
        .value();

const schema = goDeep(DATA);
console.log(JSON.stringify(schema, null, ' '));
// console.log(YAML.stringify({ schema }));
