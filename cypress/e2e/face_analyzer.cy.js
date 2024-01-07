/// <reference types="cypress" />

describe('Face Analyzer App', () => {

    beforeEach(() => {
        cy.visit('/');
    })

    function userLogIn (username, password) {
        return new Cypress.Promise((resolve, reject) => {
            cy.url().should('include', 'https://faceanalyzer.plavy.me/login');

            // Enter the credentials and submit the form
            cy.get('#username').type(username);
            cy.get('#password').type(password);
            cy.contains('Log in').click();
        })
    }

    it('AT-01: Administrator create user account', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the user management panel
        cy.get('.MuiButtonBase-root .icon').eq(0).click();
        cy.get('.MuiPaper-root').should('be.visible');
        cy.get('.MuiListItemButton-root:contains("Users")').click({ force: true });        
        cy.url().should('include', 'https://faceanalyzer.plavy.me/users');

        // Administrator clicks on "Add User"
        cy.contains('Add user').click();

        // Administrator fills in the personal information and submits the form
        cy.fixture('researcher').then((data) => {
            cy.get('#name').type(data.name);
            cy.get('#surname').type(data.surname);
            cy.get('#username').type(data.username);
            cy.get('#password').type(data.password);
            cy.get('#email').type(data.email);
            cy.get('#contactNumber').type(data.contact);
            cy.get('#role').select(data.role);
        });
        cy.contains('Save').click();

        // Administrator logs out
        cy.get('.MuiAvatar-root .MuiAvatar-img').click();
        cy.get('.MuiPopper-root').should('be.visible');
        cy.get('.MuiListItemButton-root:contains("Logout")').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/login');

        // New user logs in
        cy.fixture('researcher').then((data) => {
            cy.get('#username').type(data.username);
            cy.get('#password').type(data.password);
            cy.contains('Log in').click();
        });
    })

    it('AT-04: Researcher logs in, sees all projects and logs out', () => {
        // Researcher logs in
        cy.fixture('researcher').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Researcher only sees the configuration and projects to which permission has been given
        // To check this, we verify that the researcher is not able to create projects
        cy.get('.MuiBox-root').find('.MuiAvatar-root .MuiSvgIcon-root').should('not.exist');
    })

    it('AT-02: Administrator delete account', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the user management panel
        cy.get('.MuiButtonBase-root .icon').eq(0).click();
        cy.get('.MuiPaper-root').should('be.visible');
        cy.get('.MuiListItemButton-root:contains("Users")').click({ force: true });        
        cy.url().should('include', 'https://faceanalyzer.plavy.me/users');

        // Administrator clicks on "Delete" inside a specific user
        cy.fixture('researcher').then((data) => {
            cy.contains('.MuiDataGrid-cellContent', data.username)
            .parent('.MuiDataGrid-cell')
            .parent('.MuiDataGrid-row')
            .find('[id^="button-delete-user-"]')
            .click();
        });        

        // On the confirmation pop up, administrator clicks "yes"
        cy.get('#button-yes:visible').click();
        cy.fixture('researcher').then((data) => {
            cy.contains('.MuiDataGrid-cellContent', data.username).should("not.exist")
        });
    })

    it('AT-03: Administrator logs in, sees all projects and logs out', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator sees all the settings and projects
        // To check this, we verify that the administrator is able to create projects
        cy.get('.MuiBox-root').find('.MuiAvatar-root .MuiSvgIcon-root').should('exist');
    })

    it('AT-05: Administrator creates project, edits it and removes it', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on "Add projects"
        cy.get('#add-project-button').click();

        // Administrator fills the name of the project and clicks on "Save"
        cy.get('#projectName').type('E2EProject');
        cy.contains('Save').click();

        // Administrator can see the project on the project management panel
        cy.contains('.MuiGrid-root .MuiTypography-root', 'E2EProject').should("exist")
        cy.contains('.MuiGrid-root .MuiTypography-root', 'E2EProject').should('be.visible');

        // Administrator clicks on "Edit" inside the project
        cy.contains('.MuiGrid-root .MuiTypography-root', 'E2EProject')
            .parent('.MuiBox-root')
            .get('[id^="menu-project-"]')
            .eq(0)
            .click();
        cy.get('.MuiMenuItem-root:contains("Edit")').filter(':visible').click();

        // Administrator changes the title of the project and submits the form
        cy.get('#projectName').type(' 2');
        cy.contains('Update').click({ force: true });

        // Administrator can see the project title changed on the project management panel
        cy.contains('.MuiGrid-root .MuiTypography-root', 'E2EProject 2').should("exist")

        // Administrator clicks on "Delete" inside the project
        cy.contains('.MuiGrid-root .MuiTypography-root', 'E2EProject 2')
            .parent('.MuiBox-root')
            .get('[id^="menu-project-"]')
            .eq(0)
            .click();
        cy.get('.MuiMenuItem-root:contains("Delete")').filter(':visible').click();

        // On the confirmation pop up, administrator clicks "yes"
        cy.get('#button-yes:visible').click();

        // Administrator can not see the project on the project management panel
        cy.contains('.MuiGrid-root .MuiTypography-root', 'E2EProject 2').should("not.exist")
    })

    it('AT-06: Administrator grants and revokes project permissions', () => {        
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on a project
        cy.contains('.MuiTypography-root', 'E2E Tests')
            .parent('.MuiBox-root')
            .find('[id^="button-open-project-"]')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/project/123');

        // Administrator clicks on "Edit Researchers"
        cy.contains('.MuiTypography-root.MuiTypography-body1.css-1wu5z7k', 'E2E Tests')
            .closest('.MuiCard-root')
            .find('#button-researchers-edit')
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/project/123/researchers');

        // Administrator clicks on "Add researchers"
        cy.contains('Add researcher').click();

        // Administrator clicks on the researcher he wants to add to the project
        cy.get('#researcherId').select('E2E Researcher');
        cy.contains('Save').click();

        // Administrator can see the recently added researcher assigned to the project
        cy.contains('.MuiDataGrid-cell', 'researcher-e2e').should('exist')

        // Administrator clicks on the remove button next to the researcher to delete it
        cy.get('#button-remove-researcher-148').click();  

        // On the confirmation pop up, administrator clicks "yes"
        cy.get('#button-yes:visible').click();

        // Administrator can not see the previously added researcher assigned to the project
        cy.contains('.MuiDataGrid-cell', 'researcher-e2e').should('not.exist')

    })

    it('AT-07: User creates experiment, edits it and removes it', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on a project
        cy.contains('.MuiTypography-root', 'E2E Tests')
            .parent('.MuiBox-root')
            .find('[id^="button-open-project-"]')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/project/123');

        // Administrator clicks on "Add experiments"
        cy.get('.MuiAvatar-root .icon-tabler-plus').click();

        // Administrator fills the name and description of the experiment and submits the form
        cy.get('#experimentName').type('experimentName');
        cy.get('#experimentDescription').type('experimentDescription');
        cy.contains('Save').click();         
            
        // Administrator clicks on "Edit" on the created experiment
        cy.contains('.MuiTypography-root', 'experimentName')
            .parent('.MuiBox-root')
            .find('[id^="menu-undefined-"]')
            .filter(':visible')
            .eq(0)
            .click();
        cy.get('.MuiMenuItem-root:contains("Edit")').filter(':visible').click();

        // Administrator changes the title and description of the experiment and clicks "Update"
        cy.get('#experimentName').type(' 2');
        cy.get('#button-update').filter(':visible').click();

        // Administrator can see the experiment with the description changed on the project screen
        cy.contains('.MuiTypography-root', 'experimentName 2').should("exist");

        // Administrator clicks on "Delete"
        cy.contains('.MuiTypography-root', 'experimentName')
            .parent('.MuiBox-root')
            .find('[id^="menu-undefined-"]')
            .filter(':visible')
            .eq(0)
            .click();
        cy.get('.MuiMenuItem-root:contains("Delete")').filter(':visible').click();

        // On the confirmation pop up, administrator clicks "yes"
        cy.get('#button-yes:visible').click();
        cy.contains('.MuiTypography-root', 'experimentName 2').should('not.exist')
    })

    it('AT-08: User adds note, edits it and deletes it', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on a project
        cy.contains('.MuiTypography-root', 'E2E Tests')
            .parent('.MuiBox-root')
            .find('[id^="button-open-project-"]')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/project/123');

        // Administrator clicks on an experiment
        cy.contains('.MuiTypography-root', 'E2E Experiment')
            .parent('.MuiBox-root')
            .find('[id^="button-open-undefined-"]')
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/experiment/57');

        // Administrator clicks on the notes button
        cy.get('#button-notes-57').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/experiment/57/notes');

        // Administrator clicks on the button "Add note"
        cy.get('#add-note-button').click();

        // Administrator fills in the form with the note and submits it
        cy.get('#noteDescription').type('Note description');
        cy.get('#button-save').filter(':visible').click();

        // Administrator can see the recently added note in the experiment screen
        cy.contains('.MuiPaper-root', 'Note description').should('exist')

        // Administrator clicks on the created note
        cy.get('[id^="menu-notes-card-"]:visible').click();

        // On the note page administrator clicks on "View"
        cy.get('[id^="button-show-note-"]:visible').click();

        // Administrator changes the note and clicks submit
        cy.get('#noteDescription').type(' 2');
        cy.get('#button-save').click();

        // Administrator can see the note changed
        cy.contains('.MuiPaper-root', 'Note description 2').should('exist')

        // Administrator clicks on the cross button next to the note to delete it
        cy.get('[id^="menu-notes-card-"]:visible').click();
        cy.get('[id^="button-delete-note-"]:visible').click();

        // On the confirmation pop up, administrator clicks "yes"
        cy.get('#button-yes:visible').click();
        cy.contains('.MuiPaper-root', 'Note description 2').should('not.exist')
    })

    it('AT-09: User adds stimuli video and removes it', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on a project
        cy.contains('.MuiTypography-root', 'E2E Tests')
            .parent('.MuiBox-root')
            .find('[id^="button-open-project-"]')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/project/123');

        // Administrator clicks on an experiment
        cy.contains('.MuiTypography-root', 'E2E Experiment')
            .parent('.MuiBox-root')
            .find('[id^="button-open-undefined-"]')
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/experiment/57');

        // Administrator clicks on the button of "Add stimuli"
        cy.get('.MuiAvatar-root .icon-tabler-plus').click();

        // Administrator fills in the name, description and link to the video and submits the form
        cy.get('#stimulusName').type('Stimulus name');
        cy.get('#stimulusDescription').type('Stimulus description');
        cy.get('#stimulusLink').type('https://www.youtube.com/watch?v=_lzyackHXAw');
        cy.contains('Save').click();

        // Administrator can see the recently added video in the experiment screen
        cy.contains('.MuiGrid-root .MuiTypography-root', 'Stimulus name').should("exist");

        // Administrator clicks on on the cross button next to the video to delete it
        cy.contains('.MuiTypography-root', 'Stimulus name')
            .parent('.MuiBox-root')
            .find('[id^="menu-stimulus-"]')
            .filter(':visible')
            .click();
        cy.get('[id^="menu-stimulus-"][id$="-delete"]:visible').click();

        // On the confirmation pop up, administrator clicks "yes"
        cy.get('#button-yes:visible').click();
        cy.contains('.MuiGrid-root', 'Stimulus name').should('not.exist')
    })

    it('AT-10: User records reaction and deletes it', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on a project
        cy.contains('.MuiTypography-root', 'E2E Tests')
            .parent('.MuiBox-root')
            .find('[id^="button-open-project-"]')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/project/123');

        // Administrator clicks on an experiment
        cy.contains('.MuiTypography-root', 'E2E Experiment')
            .parent('.MuiBox-root')
            .find('[id^="button-open-undefined-"]')
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/experiment/57');

        // Administrator clicks on a stimuli video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on the button "Start recording"
        cy.get('#button-toggle-recording').filter(':visible').click();

        // Administrator clicks on the button "Start recording"        
        cy.get('#button-toggle-recording').filter(':visible').click();

        // Administrator should click on the button "Save", but since there is no participant
        // on the test it is still disable
        //cy.get('#button-save-reaction').filter(':visible').click();

        // Administrator fills the name and surname of the participant and submits the form
        //cy.get('#name').type('E2E');
        //cy.get('#surname').type('Participant');
        //cy.get('#button-save').click();

        // Administrator can see the recently added reaction in the stimuli video screen
        //cy.contains('.MuiGrid-root .MuiTypography-root', 'E2E Participant').should("exist")

        // Administrator clicks on the delete button next to the reaction to delete it
        /*cy.contains('.MuiGrid-root .MuiTypography-root', 'E2E Participant')
            .parents('.MuiBox-root')
            .find('.MuiButtonBase-root:contains("Delete")')
            .eq(1)
            .click();*/

        // On the confirmation pop up, administrator clicks "yes"
        //cy.get('#button-yes:visible').click();
    })

    it('AT-11: User downloads all the raw data of visage|SDK and the raw data for a single reaction', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on a project
        cy.contains('.MuiTypography-root', 'E2E Tests')
            .parent('.MuiBox-root')
            .find('[id^="button-open-project-"]')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/project/123');

        // Administrator clicks on an experiment
        cy.contains('.MuiTypography-root', 'E2E Experiment')
            .parent('.MuiBox-root')
            .find('[id^="button-open-undefined-"]')
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/experiment/57');

        // Administrator clicks on a stimuli video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on the statistics button of a reaction
        cy.get('#button-stats-reaction-129').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/reaction/129/statistics', { timeout: 10000 });

        // Administrator clicks on 'Export CSV' button to download the raw data of visage|SDK for a single reaction
        cy.get('#button-export-csv').should('exist');
    })

    it('AT-12: User sees emotions over time', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on a project
        cy.contains('.MuiTypography-root', 'E2E Tests')
            .parent('.MuiBox-root')
            .find('[id^="button-open-project-"]')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/project/123');

        // Administrator clicks on an experiment
        cy.contains('.MuiTypography-root', 'E2E Experiment')
            .parent('.MuiBox-root')
            .find('[id^="button-open-undefined-"]')
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/experiment/57');

        // Administrator clicks on a stimuli video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on the statistics button of a reaction
        cy.get('#button-stats-reaction-129').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/reaction/129/statistics', { timeout: 10000 });

        // Administrator sees a plot that shows how magnitudes of basic emotions change over time
        cy.get('#button-emotions-over-time').should('exist');
    })

    it('AT-13: User sees dynamic charts', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on a project
        cy.contains('.MuiTypography-root', 'E2E Tests')
            .parent('.MuiBox-root')
            .find('[id^="button-open-project-"]')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/project/123');

        // Administrator clicks on an experiment
        cy.contains('.MuiGrid-root .MuiTypography-root', 'E2E Experiment')
            .parent('.MuiBox-root')
            .find('.MuiAvatar-root')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/experiment/57');

        // Administrator clicks on a stimuli video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on the statistics button of a reaction
        cy.get('#button-stats-reaction-129').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/reaction/129/statistics', { timeout: 10000 });

        // Administrator can see a plot that shows how magnitudes of basic emotions change over time
        cy.get('#button-dynamic-chart').should('exist');
    })

    it('AT-14: User sees distributions of participants emotion', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on a project
        cy.contains('.MuiTypography-root', 'E2E Tests')
            .parent('.MuiBox-root')
            .find('[id^="button-open-project-"]')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/project/123');

        // Administrator clicks on an experiment
        cy.contains('.MuiGrid-root .MuiTypography-root', 'E2E Experiment')
            .parent('.MuiBox-root')
            .find('.MuiAvatar-root')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/experiment/57');

        // Administrator clicks on a stimuli video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on the statistics button of a reaction
        cy.get('#button-stats-reaction-129').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/reaction/129/statistics', { timeout: 10000 });

        // Administrator can see a plot that shows how magnitudes of basic emotions change over time
        cy.get('#button-emotions-distribution').should('exist');
    })

    it('AT-15: User sees emotions in time per experiment', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on a project
        cy.contains('.MuiTypography-root', 'E2E Tests')
            .parent('.MuiBox-root')
            .find('[id^="button-open-project-"]')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/project/123');

        // Administrator clicks on an experiment
        cy.contains('.MuiGrid-root .MuiTypography-root', 'E2E Experiment')
            .parent('.MuiBox-root')
            .find('.MuiAvatar-root')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/experiment/57');

        // Administrator clicks on a stimuli video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on "Collective statistics"
        cy.get('#button-collective-stats').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98/statistics');
    })

    it('AT-16: User exports a single visualization and all visualizations in CSV files', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on a project
        cy.contains('.MuiTypography-root', 'E2E Tests')
            .parent('.MuiBox-root')
            .find('[id^="button-open-project-"]')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/project/123');

        // Administrator clicks on an experiment
        cy.contains('.MuiGrid-root .MuiTypography-root', 'E2E Experiment')
            .parent('.MuiBox-root')
            .find('.MuiAvatar-root')
            .eq(0)
            .click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/experiment/57');

        // Administrator clicks on a stimuli video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on "Collective statistics"
        cy.get('#button-collective-stats').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98/statistics');

        // Administrator clicks on "Export Collective CSV"
        cy.get('#button-export-csv').click();
    })
})