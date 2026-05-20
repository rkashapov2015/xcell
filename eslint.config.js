import globals from "globals";
// import importPlugin from "eslint-plugin-import";

export default [
  {
    files: ["**/*.js"],
    // plugins: {
    //   import: importPlugin,
    // },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    settings: {
      "import/resolver": {
        node: true,
      },
    },
    rules: {
      "no-underscore-dangle": ["error"],
      "no-plusplus": ["error"],
      "no-useless-call": ["off"],
      radix: ["error"],
      "no-shadow": ["error"],
      "no-shadow-restricted-names": ["error"],
      "no-undef": ["error"],
      "no-undef-init": ["error"],
      "no-undefined": ["off"],
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
        },
      ],
      "no-use-before-define": [
        "error",
        {
          functions: true,
          classes: true,
          variables: true,
        },
      ],
      camelcase: [
        "error",
        {
          properties: "never",
          ignoreDestructuring: false,
          ignoreImports: false,
          ignoreGlobals: false,
        },
      ],
      "no-console": "error",
      "no-useless-rename": [
        "error",
        {
          ignoreDestructuring: false,
          ignoreImport: false,
          ignoreExport: false,
        },
      ],
      "no-var": ["error"],
      "object-shorthand": [
        "error",
        "always",
        {
          ignoreConstructors: false,
          avoidQuotes: true,
        },
      ],
      "prefer-arrow-callback": [
        "error",
        {
          allowNamedFunctions: false,
          allowUnboundThis: true,
        },
      ],
      "class-methods-use-this": [
        "error",
        {
          exceptMethods: [],
          enforceForClassFields: true,
        },
      ],
      "consistent-return": ["error"],
      "default-case": [
        "error",
        {
          commentPattern: "^no default$",
        },
      ],
      "no-case-declarations": ["error"],
      "no-constructor-return": ["error"],
      "no-div-regex": ["off"],
      "no-else-return": [
        "error",
        {
          allowElseIf: false,
        },
      ],
      "no-empty-function": [
        "error",
        {
          allow: ["arrowFunctions", "functions", "methods"],
        },
      ],
      eqeqeq: [
        "error",
        "always",
        {
          null: "ignore",
        },
      ],
      "no-empty-pattern": ["error"],
      "default-case-last": ["error"],
      "default-param-last": ["error"],
      "no-unused-private-class-members": ["off"],
      "no-inner-declarations": ["error"],
      "prefer-const": [
        "error",
        {
          destructuring: "any",
          ignoreReadBeforeAssign: true,
        },
      ],
      "prefer-destructuring": [
        "error",
        {
          VariableDeclarator: {
            array: false,
            object: true,
          },
          AssignmentExpression: {
            array: true,
            object: false,
          },
        },
        {
          enforceForRenamedProperties: false,
        },
      ],
    },
  },
];
