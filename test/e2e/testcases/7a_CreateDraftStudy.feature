@userRes
Feature: Checking Ordinal Values in a Draft Study

    Scenario: Login as Participant 2
        Given I am on the login page
        When I enter Participant 2 User credentials
        Then I am logged in

    Scenario: Once Logged in you are on the Norman Page
        Given I am on the Landing Page
        When  I click New Project
        And  I enter Project Name
        Then The project is created

    Scenario: Once a project is created
        Given A project exists
        When I click to enter the project
        Then I am in the prototype page

    Scenario: User clicks on User Research.
        When  I click into User Research
        Then  Create New Study button is displayed

    Scenario: Create New Draft Study.
        Given I am on the study list page
        When  create new study button is clicked
        And   name and description pop-up should be displayed
        And   User enters StudyName "Draft Study" and StudyDescription "This is a draft Study" in the name and description pop-up
        And   I Click Save Study
        Then  the study is created

    Scenario: Upload files through upload link
        Given I am on the study edit page
        When  I Upload images
        And   I Confirm Upload of Images
        Then  selected Images "4" should displayed on the page

    Scenario: Associating questions to first image
        Given I am on the study edit page
        When  I click on tile "1"
        And   the image enlarges

    Scenario: Add Question to Image 1
        Given   The Question Popover is Open
        When    I enter a question "1" Free Text Only
        And     Click Save and Close
        And     I click on tile "2"
        When    I enter a question "Image2" Free Text Only
        And     Click Save and Close
        And     I click on tile "3"
        When    I enter a question "Image3" Free Text Only
        And     Click Save and Close
        And     I click on tile "4"
        When    I enter a question "Image4" Free Text Only
        And     Click Save and Close

    Scenario: Re enter the study
        Given I am on the study edit page
        When  I click Research in Nav Bar
        Then  Create New Study button is displayed

    Scenario: Click into Draft Studies
        Given   I am on the study list page
        When    I click draft study list
        Then    Study name should be "Draft Study"
        When    I click on Study Tile
        Then    I see "4" Images with Question Ticks

    Scenario: Associating questions to first image
        Given I am on the study edit page
        When  I click on tile "1"
        And   the image enlarges

    Scenario: Check Ordinal
        Given   The Question Popover is Open
        When    I check if Image 1 matches text of 1
        And     Click Save and Close
        And     I click on tile "2"
        When    I check if Image 2 matches text of Image 2
        And     Click Save and Close
        And     I click on tile "3"
        When    I check if Image 3 matches text of Image 3
        And     Click Save and Close
        And     I click on tile "4"
        When    I check if Image 4 matches text of Image 4
        Then    Click Save and Close
        Then    Questions are saved
