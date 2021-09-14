export default function ({
  map,
  stringp,
  and,
  or,
  regexp,
  boolean,
  int,
  nil,
  chainId,
  ethHexAddress,
  base32ContractAddress,
  posInt,
  uri,
  repeat,
  mapOf,
  sequential,
  inst,
  set,
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
    ['name', [and, [stringp, {min: 1, max: 20}], [regexp, '^[ \\w]+$']]],
    [
      'description',
      [and, [stringp, {min: 1, max: 200}], [regexp, '^[ \\w\\.,]+$']],
    ],
  ]
  const TokenInfoSchema = [
    map,
    {closed: true},
    ['chainId', chainId],
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
    [
      'symbol',
      [
        and,
        [regexp, '^[a-zA-Z0-9+\\-%\\/\\$]+$'],
        [stringp, {min: 1, max: 20}],
      ],
    ],
    ['logoURI', {optional: true}, uri],
    [
      'tags',
      {optional: true},
      [repeat, {min: 0, max: 10}, TagIdentifierSchema],
    ],
    [
      'extensions',
      {optional: true},
      [
        and,
        [mapOf, ExtensionIdentifierSchema, ExtensionValueSchema],
        [sequential, {min: 0, max: 20}],
      ],
    ],
  ]
  const TokenListSchema = [
    map,
    {closed: true},
    ['name', [and, [stringp, {min: 1, max: 20}], [regexp, '^[ \\w]+$']]],
    ['timestamp', inst],
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
        set,
      ],
    ],
    [
      'tags',
      {optional: true},
      [
        and,
        [mapOf, TagIdentifierSchema, TagDefinitionSchema],
        [sequential, {min: 1, max: 20}],
      ],
    ],
    ['logoURI', {optional: true}, uri],
  ]

  return TokenListSchema
}
