This project is a smart contract generator. It provides options for users to build smart contracts using components from OpenZeppelin Contracts, for       
  Solidity and various other languages and ecosystems. Your task is not to create one skill, but to create a high level proposal and specification of the    
  TYPES of skills we want to provide. The goal of this collection of skills will be to help users write secure smart contracts using the various             
  OpenZeppelin Contracts libraries and components. This needs to include, at minimum, best practices for installing and importing from OpenZeppelin          
  Contracts (for each language), smart contract guidelines, inheritance and composability, overriding (for both extensibility and when needed by the         
  compiler), upgradeability patterns for each library and language. Examine the code generation logic under 'packages/core', particularly for each language  
  and each contract type (erc20, erc721, etc. - this list differs depending on language), and pay attention to how different features are put together,      
  and which ones conceptually are incompatible. Examine the test snapshots, which end in .test.ts.md, that contain example test cases for how different      
  contracts are put together. ACCEPTANCE CRITERIA: A new markdown file with high level proposal of the overall approach, what categories of skills to        
  provide, specifications on the exact skills for general use and language specific skills, and HOW you will determine the best practices for each of those  
  skills when you eventually write them including code references on where in the Wizard code to look for how to write those skills.