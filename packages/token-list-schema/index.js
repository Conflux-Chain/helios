export default function ({
  map,
  stringp,
  and,
  or,
  regexp,
  boolean,
  int,
  nil,
  ethHexAddress,
  base32ContractAddress,
  posInt,
  url,
  repeat,
  mapOf,
  jsinst,
  tokenSymbol,
  jssetp,
  integer,
}) {
  const VersionSchema = [
    map,
    {closed: true},
    ['major', [integer, {min: 0}]],
    ['minor', [integer, {min: 0}]],
    ['patch', [integer, {min: 0}]],
  ]
  const TagIdentifierSchema = [
    and,
    [stringp, {min: 1, max: 10}],
    [regexp, '^[\\w]+$'],
  ]
  const ExtensionIdentifierSchema = [
    and,
    [stringp, {min: 1, max: 30}],
    [regexp, '^[\\w]+$'],
  ]
  const ExtensionValueSchema = [
    or,
    nil,
    boolean,
    int,
    [stringp, {min: 1, max: 42}],
  ]
  const TagDefinitionSchema = [
    map,
    {closed: true},
    ['name', [and, [stringp, {min: 1, max: 40}], [regexp, '^[ \\w]+$']]],
    [
      'description',
      [and, [stringp, {min: 1, max: 200}], [regexp, '^[ \\w\\.,]+$']],
    ],
  ]
  const TokenInfoSchema = [
    map,
    {closed: true},
    ['chainId', int],
    ['address', [or, ethHexAddress, base32ContractAddress]],
    ['decimals', [posInt, {max: 255}]],
    [
      'name',
      [
        and,
        [regexp, "^[ \\w.'+\\-%\\/À-ÖØ-öø-ÿ:]+$"],
        [stringp, {min: 1, max: 40}],
      ],
    ],
    ['symbol', tokenSymbol],
    ['logoURI', {optional: true}, url],
    [
      'tags',
      {optional: true},
      [repeat, {min: 0, max: 10}, TagIdentifierSchema],
    ],
    [
      'extensions',
      {optional: true},
      [
        mapOf,
        {min: 0, max: 20},
        ExtensionIdentifierSchema,
        ExtensionValueSchema,
      ],
    ],
  ]
  const TokenListSchema = [
    map,
    {closed: true},
    ['name', [and, [stringp, {min: 1, max: 20}], [regexp, '^[ \\w]+$']]],
    ['timestamp', jsinst],
    ['version', VersionSchema],
    ['tokens', [repeat, {min: 1, max: 10000}, TokenInfoSchema]],
    [
      'keywords',
      {optional: true},
      [
        and,
        [
          repeat,
          {min: 1, max: 20},
          [and, [stringp, {min: 1, max: 20}], [regexp, '^[ \\w]+$']],
        ],
        jssetp,
      ],
    ],
    [
      'tags',
      {optional: true},
      [mapOf, {min: 1, max: 20}, TagIdentifierSchema, TagDefinitionSchema],
    ],
    ['logoURI', {optional: true}, url],
  ]

  return TokenListSchema
}
