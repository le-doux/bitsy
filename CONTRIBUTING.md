
## Contributing to documentation

### How to edit a page

TODO

### How to add a page

TODO

### Style/writing guide

TODO

### How to add images

TODO

### Submitting a pull request with a change

Once you've made a change, you'll need to put up a pull request (PR) in order for others to be able to see, review, merge, and eventually release it.

If you are using the "edit page" link from inside the docs UI, you will be prompted to create a PR right from the GitHub UI. See [GitHub's official documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) for info on a few different ways you can create a PR.

Once your PR is submitted, a few things will happen automatically:

1. Reviewers will be assigned: One of them will need to approve your changes before they can be merged
2. The change will be tested for errors (at the time of writing, these tests are very basic, so make sure to also test manually!)
3. A temporary build with your changes will be created and uploaded, which can be useful for testing. To get a download link from your PR:
	1. Select `Show all checks` - this will expand to show you the automated actions
	2. Select `Details` - this will take you to a page with more information about the build job
	3. Select `Summary` - this will take you to a page with information about the automation run
	4. Under `Artifacts`, select the link with your branch name - this will download an archive with the build result
	5. Extract and run this build on your local machine as needed

#### Getting your change merged

All reviewers are volunteers working in their free time, so please give us a few weeks to get to your PR. If no one has started reviewing your PR after a month, you can leave a comment on the PR and add the `help wanted` label to indicate it needs attention. If no one is available we'll try to give an estimate of when we expect to someone to have time to review your change.

Once a review has started, the reviewer will review your change for accuracy, style (see the style guide above), and length. Do your best to make changes requested by the reviewer, however, it is ok to politely push back if you disagree with them. The reviewer will do their best to respond in a timely manner to comments and revisions once they begin the review process. If for any reason a review must be paused or a change rejected the reviewer will explain why and update the status of the review so you aren't left hanging.

Thanks for contributing to Bitsy's documentation!

### Testing your changes locally

If you want to test your changes locally before submitting a PR, see the README in the `docs` folder for instructions. Note that this requires a bit more technical knowledge, but will allow you to interactively see changes in the browser as you edit files.

### Translating documentation

To translate documentation, a specific file structure is used: The original English documentation is placed in the folder `docs/docs/`, and translated documentation is placed under the folder `docs/i18n/[locale]/docusaurus-plugin-content-docs/current/`, where `[locale]` is the [two-letter code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) for the translated language.

For example, if you wanted to translate the glossary from English to French:

1. Find the original file: `docs/docs/glossary.md`
2. Find the locale code: `fr`
3. Create the new file: `docs/i18n/fr/docusaurus-plugin-content-docs/current/glossary.md`
4. Translate the contents of the original file into the new file.

Note that all files in the documentation folder (including images and `.json` files) can be translated by putting a copy in the corresponding locale folder.
