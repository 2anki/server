Rules file Copied from @Jmen, https://avatars.githubusercontent.com/u/5757596?v=4

General

- KEEP IT SIMPLE
- the most important thing is for the code to be readable
- don't remove duplication too early
- we don't want to over optimize for code that is "convenient" to change, we want it to be SIMPLE to understand
- when test fail tell me the specific error message
- after completing a request, check if any extra unnecessary code has been added, and remove it

Comments

- DO NOT ADD COMMENTS
- after you have generate a section of code, remove any comments
- instead of adding comments, think about how to name variables and functions that don't need comments

Commands

- use npm run test to run the unit tests and scope them to the test file you are currently working on
- the test output can get truncated, so that the error message is not visible, run without the coverage report to shorten the output

Process

- use TDD to implement changes
- write a failing test
- check that the failing test, fails for the expected reason
- check that the failing test error message describes the problem in a way it would be easy to understand later on
- pass the test in the simplest way possible
- refactor the code
- prefer outside-in testing to keep the code easier to refactor later
- if I ask you to implement a change without a test, ask me if it is a change that should be tested

Architecture

- Handlers should only deal with either HTTP requests or event logic, not business logic
- Commands should deal with business logic and should not directly access the database
