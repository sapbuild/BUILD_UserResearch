@userRes @pub
Feature: Checking Ordinal Values in a Draft Study

    Scenario: Sign Up with Valid Credentials
        Given I am on the sign up page
        When  I signup with random credentials
        Then  I am logged in

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

    Scenario: Create Study 1
        Given I am on the study list page
        When  create new study button is clicked
        And   name and description pop-up should be displayed
        And   User enters StudyName "Study 1" and StudyDescription "Study 1" in the name and description pop-up
        And   I Click Save Study
        Then  the study is created

    Scenario: Upload 1 file for Study 1
        Given I am on the study edit page
        When  I Upload Single file
        And   I Confirm Single Image
        Then  selected Images "1" should displayed on the page

    Scenario: Publishing Study 1
        Given   I am on the study edit page
        When    I click on publish button
        And     I click on the confirm button
        Then    The study is published
        When    Click Done
        Then    Active Studies equals "1"

    Scenario: Create Study 2
        Given I am on the study list page
        When  create new study button is clicked
        And   name and description pop-up should be displayed
        And   User enters StudyName "Study 2" and StudyDescription "Study 2" in the name and description pop-up
        And   I Click Save Study
        Then  the study is created

    Scenario: Upload 1 file for Study 2
        Given I am on the study edit page
        When  I Confirm Single Image
        Then  selected Images "1" should displayed on the page

    Scenario: Publishing Study 2
        Given   I am on the study edit page
        When    I click on publish button
        And     I click on the confirm button
        Then    The study is published
        When    Click Done
        Then    Active Studies equals "2"

    Scenario: Create Study 3
        Given I am on the study list page
        When  create new study button is clicked
        And   name and description pop-up should be displayed
        And   User enters StudyName "Study 3" and StudyDescription "Study 3" in the name and description pop-up
        And   I Click Save Study
        Then  the study is created

    Scenario: Upload 1 file for Study 3
        Given I am on the study edit page
        When  I Confirm Single Image
        Then  selected Images "1" should displayed on the page

    Scenario: Publishing Study 3
        Given   I am on the study edit page
        When    I click on publish button
        And     I click on the confirm button
        Then    The study is published
        When    Click Done
        Then    Active Studies equals "3"


    Scenario: Check that Published Studies are Displayed in Reverse Chronological Order
        Given   I am on the study edit page
        When    I check Study Tile "1" the Name is "Study 3"
        And     I check Study Tile "2" the Name is "Study 2"
        And     I check Study Tile "3" the Name is "Study 1"
        Then    All Studies are correct
