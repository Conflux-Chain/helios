#!/usr/bin/env node
process.env.NODE_ENV = process.env.NODE_ENV || 'production'
require('@storybook/react/bin/build.js')
