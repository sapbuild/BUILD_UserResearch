'use strict';

var UserRe = require('../../pageobjects/userResearch.po.js');
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
var Chance = require('norman-testing-tp').chance, chance = new Chance();
var utility = require('../../support/utility.js');

chai.use(chaiAsPromised);

var path = require('path');
var sampleUpload1 = '../images/sample1.jpg';
var sampleUpload2 = '../images/sample2.jpg';
var sampleUpload3 = '../images/sample3.jpg';
var sampleUpload4 = '../images/sample4.jpg';
var sampleUpload5 = '../zip/nonangularPrototype.zip';
var sampleUpload6 = '../zip/angularPrototype.zip';


var uploadPath1 = path.resolve(__dirname,sampleUpload1 );
var uploadPath2 = path.resolve(__dirname,sampleUpload2 );
var uploadPath3 = path.resolve(__dirname,sampleUpload3 );
var uploadPath4 = path.resolve(__dirname,sampleUpload4 );
var uploadPath5 = path.resolve(__dirname,sampleUpload5 );
var uploadPath6 = path.resolve(__dirname,sampleUpload6 );


var studyUrl;

var expect = chai.expect;
var UserRePage = new UserRe('');

var studyName, studyDesc;

var projectURL;

studyName = "Test Study";
studyDesc = "Brief and not descriptive description";

var tileNum = 0;

module.exports = function() {

    this.Given(/^The Question Popover is Open$/, function (callback) {
        expect(UserRePage.screen_window.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Given(/^I save the Project URL$/, function (callback) {
        browser.driver.getCurrentUrl().then(function(url){
            projectURL = url;
            utility.projUrl = projectURL;/*.set(projectURL);*/
            callback();
        });
    });

    this.Given(/^I am on the Published Study Page$/, function (callback) {
        expect(UserRePage.txtStudyLink.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^I enter a question "([^"]*)" Annotation Only$/, function (question, callback) {
        UserRePage.AnnoOnly();
        UserRePage.checkAnno();
        UserRePage.EnterQuestionAnnotionOnly(question);
        UserRePage.setAnnotationLimit(3);
        var char = question.length;
        var CharStart = 500;
        var charLimit =CharStart - char;
        expect(UserRePage.charLimit.getText()).to.eventually.equal(charLimit.toString()).and.notify(callback);
    });

    this.When(/^I enter a question "([^"]*)" Free Text Only$/, function (question, callback) {
        //UserRePage.activateFreeTxtOnly();
        UserRePage.freeText();
        UserRePage.EnterQuestionFreeTextOnly(question);
        browser.sleep(500);
        callback();
    });

    this.When(/^Enter a question "([^"]*)" Free Text Only$/, function (question, callback) {
        //UserRePage.activateFreeTxtOnly();
        UserRePage.freeText2();
        UserRePage.EnterQuestionFreeTextOnly2(question);
        browser.sleep(500);
        callback();
    });

    this.When(/^I enter a question "([^"]*)" Multiple Choice Only 2 options$/, function (question, callback) {
        //UserRePage.activateMltChoiceOnly();
        UserRePage.mltChoice();
        UserRePage.EnterQuestionMultipleChoice2Answers(question, 'This', 'That');
        browser.sleep(500);
        callback();
    });

    this.When(/^I enter a question "([^"]*)" Multiple Choice More than 2 options$/, function (question, callback) {
        //UserRePage.activateMltChoiceOnly();
        UserRePage.mltChoice();
        //UserRePage.activateMultipleChoiceCheckBox();
        UserRePage.checkMltAns();
        UserRePage.EnterQuestionMultipleChoice3Answers(question, 'This', 'That', 'Those');
        browser.sleep(500);
        callback();
    });

    this.When(/^Click Done$/, function (callback) {
        UserRePage.clickPublishDone();
        browser.sleep(1000);
        callback();
    });

    this.When(/^Click Save and Close$/, function (callback) {
        UserRePage.clickSaveAndClose();
        browser.sleep(1000);
        callback();
    });

    this.When(/^Click Save and Next$/, function (callback) {
        UserRePage.clickSaveAndNext();
        browser.sleep(1000);
        callback();
    });

    this.Then(/^The Study is Active$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.studyNumbers.get(0).getText()).to.eventually.equal('1').and.notify(callback);
    });

    this.Then(/^Active Studies equals "([^"]*)"$/, function (num, callback) {
        browser.waitForAngular();
        expect(UserRePage.studyNumbers.get(0).getText()).to.eventually.equal(num).and.notify(callback);
    });


    this.When(/^research tab is clicked$/, function (callback) {
        UserRePage = new UserRe("");
        browser.waitForAngular()
        UserRePage.tabResearch.click();
        callback();
    });

    this.Then(/^Create New Study button is displayed$/, function (callback) {
        expect(UserRePage.btnCreateStudy.isPresent()).to.eventually.equal(true).and.notify(callback);
    });

    this.Given(/^I am on the study list page$/, function (callback) {
        UserRePage = new UserRe("");
        callback();
    });

    this.When(/^create new study button is clicked$/, function (callback) {
        browser.waitForAngular();
        UserRePage.clickNewStudy();
        browser.sleep(1000);
        callback();
    });

    this.When(/^I click into User Research$/, function (callback) {
        browser.waitForAngular();
        var control = browser.driver.findElement(by.css('.ui-menu-option.research'));
        browser.driver.executeScript("arguments[0].click()", control);
        browser.sleep(1000);
        callback();
    });

    this.When(/^name and description pop-up should be displayed$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.txtEditName.isPresent()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^User enters StudyName and StudyDescription in the name and description pop-up$/, function (callback) {
        browser.waitForAngular();
        UserRePage.createStudyUi(studyName,studyDesc);
        callback();

    });

    this.When(/^User enters StudyName "([^"]*)" and StudyDescription "([^"]*)" in the name and description pop-up$/, function (studyName,studyDesc,callback) {
        browser.waitForAngular();
        UserRePage.createStudyUi(studyName,studyDesc);
        callback();

    });

    this.When(/^I Click Save Study$/, function (callback) {
        browser.waitForAngular();
        UserRePage.clickSave();
        browser.sleep(1000);
        callback();
    });

    this.Then(/^the study is created$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.btnPencil.isDisplayed()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^I Upload images$/, function (callback) {
        browser.waitForAngular();
        UserRePage.doUpload(uploadPath1);
        browser.sleep(1000);
        UserRePage.doUpload(uploadPath2);
        browser.sleep(1000);
        UserRePage.doUpload(uploadPath3);
        browser.sleep(1000);
        UserRePage.doUpload(uploadPath4);
        browser.sleep(1000);
        callback();
    });

    this.When(/^I Upload Single file$/, function (callback) {
        browser.waitForAngular();
        UserRePage.doUpload(uploadPath1);
        browser.sleep(1000);
        callback();
    });

    this.When(/^I upload a Zip file$/, function (callback) {
        browser.waitForAngular();
        UserRePage.uploadZip(uploadPath5);
        browser.sleep(50);
        expect(UserRePage.progressBar.isEnabled()).to.eventually.equal(true);
        //browser.wait(UserRePage.snapshotTick.isPresent());
        browser.driver.wait(function() {
            return browser.driver.isElementPresent(by.css(".snapshot-selected-tick"));
        });
        callback();
    });

    this.When(/^I upload "([^"]*)" Zip file$/, function (file, callback) {
        browser.waitForAngular();
        var upload = path.resolve(__dirname,file );
        UserRePage.uploadZip(upload);
        browser.sleep(50);
        expect(UserRePage.progressBar.isEnabled()).to.eventually.equal(true);
        //browser.wait(UserRePage.snapshotTick.isPresent());
        browser.driver.wait(function() {
            return browser.driver.isElementPresent(by.css(".snapshot-selected-tick"));
        });
        callback();
    });

    this.When(/^I Confirm Upload of Images$/, function (callback) {
        browser.waitForAngular();
        UserRePage.clickNewQst();
        browser.sleep(1000);
        UserRePage.clickImgThumbs();
        browser.sleep(1000);
        UserRePage.clickSelect();
        browser.sleep(1000);
        callback();
    });

    this.When(/^I Confirm Single Image$/, function (callback) {
        browser.waitForAngular();
        UserRePage.clickNewQst();
        browser.sleep(1000);
        UserRePage.clickSingleImgThumbs();
        browser.sleep(1000);
        UserRePage.clickSelect();
        browser.sleep(1000);
        callback();
    });

    this.When(/^I Name the Task "([^"]*)" and Confirm$/, function (task,callback) {
        browser.waitForAngular();
        UserRePage.nameTask(task)
        callback();
    });

    this.When(/^I see Page "([^"]*)" with name "([^"]*)" exists$/, function (page, name, callback) {
        browser.waitForAngular();
        expect(UserRePage.pageFlowTileName.get(page-1).getAttribute('innerHTML')).to.eventually.equal(name).and.notify(callback);
    });

    this.When(/^Page "([^"]*)", with name "([^"]*)" exists$/, function (page, name, callback) {
        browser.waitForAngular();
        expect(UserRePage.prototypePageName.get(page-1).getText()).to.eventually.equal(name).and.notify(callback);
    });

    this.Then(/^selected Images "([^"]*)" should displayed on the page$/, function (num, callback) {
        browser.waitForAngular();
        expect(UserRePage.imgScreens.count()).to.eventually.equal(parseInt(num)).and.notify(callback);
    });

    this.Given(/^I am on the study edit page$/, function (callback) {
        browser.waitForAngular();
        UserRePage = new UserRe("");
        callback();
    });

    this.When(/^I click on tile "([^"]*)"$/, function (temp, callback) {
        browser.waitForAngular();
        var tileNum = parseInt(temp) - 1;
        UserRePage.clickTile(tileNum);
        callback();
    });

    this.Then(/^the image enlarges$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.screen_window.isPresent()).to.eventually.equal(true).notify(callback);
    });

    this.Then(/^I should be able to enter question$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.currentQuestion.isPresent()).to.eventually.equal(true).notify(callback);
    });

    this.When(/^I click next to move to second image$/, function (callback) {
        browser.waitForAngular();
        UserRePage.screen_btnNextQuest.click();
        callback();
    });

    this.When(/^I save the Study URL$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(200);
        UserRePage.studyUrl.getAttribute("value").then(function(text){
            studyUrl = text;
            utility.studyUrl = studyUrl;
            callback();
        });
    });

    this.Given(/^There is a task present$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.task.isEnabled()).to.eventually.equal(true).notify(callback);
    });

    this.When(/^I set Start and Target Pages$/, function (callback) {
        browser.waitForAngular();
        UserRePage.setStart();
        browser.waitForAngular();
        UserRePage.setTarget();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I Give some user Guidance "([^"]*)"$/, function (guidance,callback) {
        browser.waitForAngular();
        UserRePage.enterUserGuidence(guidance);
        callback();
    });

    this.When(/^I click on publish button$/, function (callback) {
        browser.waitForAngular();
        UserRePage.clickPublish();
        callback();
    });

    this.When(/^I click on the confirm button$/, function (callback) {
        browser.waitForAngular();
        UserRePage.clickPublishConfirm();
        browser.sleep(1000);
        callback();
    });

    this.Then(/^The study is published$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.btnPublishedDone.isPresent()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^I click Delete last tile$/, function (callback) {
        browser.waitForAngular();
        UserRePage.mouseOverTile();
        UserRePage.deleteLastTile();
        browser.sleep(1500);
        callback();
    });

    this.Given(/^I am in a Draft Study$/, function(callback){
        browser.waitForAngular();
        expect(UserRePage.btnPreviewDraft.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^Confirm Delete of Question$/, function(callback){
        browser.waitForAngular();
        UserRePage.confirmDeleteTile();
        browser.sleep(500);
        callback();
    });

    this.When(/^Hover over last tile$/, function(callback){
        browser.waitForAngular();
        UserRePage.mouseOverTile();
        browser.sleep(500);
        callback();
    });

    this.When(/^Drag and Drop last tile to be first$/, function (callback) {
        browser.waitForAngular();
        UserRePage.dragDrop();
        browser.sleep(500);
        callback();
    });

    this.When(/^I click Preview Icon$/, function (callback) {
        browser.waitForAngular();
        UserRePage.clickPreview();
        browser.sleep(500);
        callback();
    });

    this.When(/^I click Review Study Preview Icon$/, function (callback) {
        browser.waitForAngular();
        UserRePage.clickRevPreview();
        browser.sleep(500);
        callback();
    });

    this.When(/^Switch to New Tab$/, function (callback) {
        browser.waitForAngular();
        browser.getAllWindowHandles().then(function (handles) {
            var newWindowHandle = handles[1];
            browser.switchTo().window(newWindowHandle).then(function () {
                expect(browser.driver.getCurrentUrl()).to.eventually.match(/preview/).and.notify(callback);
            });
        });
    });

    this.Then(/^Close Tab 2 and reset to Tab 1$/, function (callback) {
        browser.waitForAngular();
        browser.getAllWindowHandles().then(function (handles) {
            var newWindowHandle = handles[1];
            browser.switchTo().window(newWindowHandle).then(function () {
                browser.executeScript('window.close()');
            });
            var originalWindow = handles[0];
            browser.switchTo().window(originalWindow).then(function () {
                callback();
            });
        });
    });

    this.Then(/^I am in the Preivew Mode$/, function (callback) {
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/preview/).and.notify(callback);
    });

    this.Given(/^I am on the participant invitation page$/, function(callback){
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/published/).and.notify(callback);
    });

    this.Given(/^I am on the participant invitation menu page$/, function(callback){
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/participant-invitation/).and.notify(callback);
    });

    this.When(/^I click email invitation textbox$/, function (callback) {
        browser.waitForAngular();
        UserRePage.clickEmailBox();
        callback();
    });

    this.When(/^I enter the email "(.*)" and click add$/, function (email, callback) {
        browser.waitForAngular();
        UserRePage.enterEmail(email);
        browser.waitForAngular();
        UserRePage.clickInviteAddBtn();
        callback();
    });

    this.When(/^Enter the email "(.*)"$/, function (email, callback) {
        browser.waitForAngular();
        UserRePage.enterEmail(email);
        callback();
    });

    this.When(/^I press delete button beside email$/, function (callback) {
        browser.waitForAngular();
        UserRePage.clickDeletePendingEmail();
        callback();
    });

    this.Then(/^Email is added to pending list$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.pendingInviteList.getText()).to.eventually.equal('tester@test.com').and.notify(callback);
    });

    this.Then(/^Second Email is added to pending list$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.pendingInviteList.getText()).to.eventually.equal('tester01@example.com').and.notify(callback);
    });

    this.Then(/^Email should be deleted$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.pendingInviteList.isPresent()).to.become(false).and.notify(callback);
    });

    this.Then(/^Email error toast should display$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.addEmailInviteErrorToast.getText()).to.eventually.equal('This is not a valid email address!').and.notify(callback);
    });

    this.When(/^Refresh Page for Textbox$/, function (callback) {
        browser.waitForAngular();
        browser.driver.navigate().refresh();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I check if Image 1 matches text of 1$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.screen_txtQuestions.first().getAttribute("value")).to.eventually.equal('1').and.notify(callback);
    });

    this.When(/^I check if Image 2 matches text of Image 2$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.screen_txtQuestions.first().getAttribute("value")).to.eventually.equal('Image2').and.notify(callback);
    });

    this.When(/^I check if Image 3 matches text of Image 3$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.screen_txtQuestions.first().getAttribute("value")).to.eventually.equal('Image3').and.notify(callback);
    });

    this.When(/^I check if Image 4 matches text of Image 4$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.screen_txtQuestions.first().getAttribute("value")).to.eventually.equal('Image4').and.notify(callback);
    });

    this.When(/^I click Sent Invitation button$/, function (callback) {
        browser.waitForAngular();
        UserRePage.clickSendInviteBtn();
        browser.sleep(1000);
        callback();

    });

    this.Then(/^An invitation has been sent$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.pendingSendInviteList.getText()).to.eventually.equal('SENT').and.notify(callback);
    });

    this.When(/^I check Study Tile "([^"]*)" the Name is "([^"]*)"$/, function (tile, study,callback) {
        browser.waitForAngular();
        var tileNum = tile-1; //-1 for 0 indexing of array
        expect(UserRePage.studyTile.get(tileNum).getAttribute('name')).to.eventually.equal(study).and.notify(callback)
    });

    this.Then(/^All Studies are correct$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.studyTile.count()).to.eventually.equal(3).and.notify(callback);
    });

};
