@userRes
Feature: Review Study

    Scenario: Return the Studies Page
        When  I click into User Research
        Then  Create New Study button is displayed

    ##########  Draft Studies  ##########

    Scenario: Return the Studies Page
        Given I am in User Research
        When  I click Research in Nav Bar
        Then  Create New Study button is displayed

    Scenario: Click into Draft Studies
        Given   I am on the study edit page
        When    I click draft study list
        Then    Study name should be "Draft Study"
        When    I click on Study Tile
        Then    I see "4" Images with Question Ticks

    Scenario: Delete Question from Draft Study Screen
        Given   I am in a Draft Study
        When    I click Delete last tile
        And     Confirm Delete of Question
        Then     I see "3" Images with Question Ticks

    Scenario: Preview the Draft Study
        Given   I am in a Draft Study
        When    I click Preview Icon
        And     Switch to New Tab
        Then    I am in the Preivew Mode
        Then    Close Tab 2 and reset to Tab 1


