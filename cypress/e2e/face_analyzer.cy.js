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

    it('AT-01: Administrator creates user account', () => {
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

    it('AT-02: Administrator deletes account', () => {
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

        // Administrator cannot see the deleted user anymore
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
        // Since it cannot be known in advance which projects will be in the database, 
        // it is checked by verifying that the administrator is able to create new projects
        cy.get('.MuiBox-root').find('.MuiAvatar-root .MuiSvgIcon-root').should('exist');
    })

    it('AT-04: Researcher logs in, sees all projects and logs out', () => {
        // Researcher logs in
        cy.fixture('researcher').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Researcher only sees the configuration and projects to which permission has been given
        // Since it cannot be known in advance which projects will be in the database, 
        // it is checked by verifying that the administrator is NOT able to create new projects
        cy.get('.MuiBox-root').find('.MuiAvatar-root .MuiSvgIcon-root').should('not.exist');
    })

    it('AT-05: User creates project, edits it and removes it', () => {
        // Administrator logs in
        cy.fixture('admin').then((data) => {
            userLogIn(data.username, data.password);
        });

        // Administrator clicks on the project management panel
        cy.get('#Projects-landing-page-card').click();       
        cy.url().should('include', 'https://faceanalyzer.plavy.me/projects');

        // Administrator clicks on "Add project"
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

        // Administrator cannnot see the project on the project management panel
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

        // Administrator cannot see the previously added researcher assigned to the project
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

        // Administrator clicks on "Add experiment"
        cy.get('.MuiAvatar-root .icon-tabler-plus').click();

        // Administrator fills the name and description of the experiment and submits the form
        cy.get('#experimentName').type('experimentName');
        cy.get('#experimentDescription').type('experimentDescription');
        cy.contains('Save').click();
        
        // Administrator can see the created experiment on the project screen
        cy.contains('.MuiTypography-root', 'experimentName').should("exist");
            
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

        // Administrator clicks on "Delete" on the updated experiment
        cy.contains('.MuiTypography-root', 'experimentName 2')
            .parent('.MuiBox-root')
            .find('[id^="menu-undefined-"]')
            .filter(':visible')
            .eq(0)
            .click();
        cy.get('.MuiMenuItem-root:contains("Delete")').filter(':visible').click();

        // On the confirmation pop up, administrator clicks "yes"
        cy.get('#button-yes:visible').click();

        // Administrator cannot see the experiment anymore
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

        // Administrator can see the recently added note
        cy.contains('.MuiPaper-root', 'Note description').should('exist')

        // Administrator clicks on "View" inside the note
        cy.get('[id^="menu-notes-card-"]:visible').click();
        cy.get('[id^="button-show-note-"]:visible').click();

        // Administrator changes the note and clicks submit
        cy.get('#noteDescription').type(' 2');
        cy.get('#button-save').click();

        // Administrator can see the note changed
        cy.contains('.MuiPaper-root', 'Note description 2').should('exist')

        // Administrator clicks on "Delete" inside the note
        cy.get('[id^="menu-notes-card-"]:visible').click();
        cy.get('[id^="button-delete-note-"]:visible').click();

        // On the confirmation pop up, administrator clicks "yes"
        cy.get('#button-yes:visible').click();

        // Administrator cannot see the note anymore
        cy.contains('.MuiPaper-root', 'Note description 2').should('not.exist')
    })

    it('AT-09: User adds stimulus video and removes it', () => {
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

        // Administrator clicks on the button "Add stimulus"
        cy.get('.MuiAvatar-root .icon-tabler-plus').click();

        // Administrator fills in the name, description and link to the video and submits the form
        cy.get('#stimulusName').type('Stimulus name');
        cy.get('#stimulusDescription').type('Stimulus description');
        cy.get('#stimulusLink').type('https://www.youtube.com/watch?v=_lzyackHXAw');
        cy.contains('Save').click();

        // Administrator can see the recently added video in the experiment screen
        cy.contains('.MuiGrid-root .MuiTypography-root', 'Stimulus name').should("exist");

        // Administrator clicks on "Delete" inside the video
        cy.contains('.MuiTypography-root', 'Stimulus name')
            .parent('.MuiBox-root')
            .find('[id^="menu-stimulus-"]')
            .filter(':visible')
            .click();
        cy.get('[id^="menu-stimulus-"][id$="-delete"]:visible').click();

        // On the confirmation pop up, administrator clicks "yes"
        cy.get('#button-yes:visible').click();

        // Administrator cannot see the video anymore
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

        // Administrator clicks on a stimulus video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on the button "Start recording"
        cy.get('#button-toggle-recording').filter(':visible').click();

        // Administrator clicks on the button "Stop recording"        
        cy.get('#button-toggle-recording').filter(':visible').click();

        // The test ends here as it is not possible to simulate a participant reacting 
        // to the video and the platform does not allow us to save the reaction
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

        // Administrator clicks on a stimulus video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on "Collective statistics"
        cy.get('#button-collective-stats').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98/statistics');

        // Administrator clicks on "Export Collective CSV"
        cy.get('#button-export-csv').click();

        // Administrator gets CSV file with all the raw data
        cy.intercept('GET', 'https://backend.faceanalyzer.plavy.me/reactions/98/emotions/export').as('download');

        // Administrator goes back one screen
        cy.go('back');

        // Administrator clicks on the statistics button of a reaction
        cy.get('#button-stats-reaction-129').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/reaction/129/statistics', { timeout: 10000 });

        // Administrator clicks on "Export CSV"
        cy.get('#button-export-csv').click();

        // Administrator gets CSV file with the raw data for that reaction
        cy.intercept('GET', 'https://backend.faceanalyzer.plavy.me/reactions/129/emotions/export').as('download');
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

        // Administrator clicks on a stimulus video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on the statistics button of a reaction
        cy.get('#button-stats-reaction-129').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/reaction/129/statistics',
         { timeout: 10000 });

        // Administrator can click on the button to see a plot that shows how magnitudes
        // of basic emotions change over time
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

        // Administrator clicks on a stimulus video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on the statistics button of a reaction
        cy.get('#button-stats-reaction-129').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/reaction/129/statistics',
         { timeout: 10000 });

        // Administrator can click on the button to see plots showing numbers
        // and corresponding bar charts dynamically while playing the video
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

        // Administrator clicks on a stimulus video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on the statistics button of a reaction
        cy.get('#button-stats-reaction-129').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/reaction/129/statistics',
         { timeout: 10000 });

        // Administrator can click on the button to see boxplots per participant which
        // shows distributions of participant's emotions
        cy.get('#button-emotions-distribution').should('exist');
    })

    it('AT-15: User sees emotions over time per stimulus video', () => {
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

        // Administrator clicks on a stimulus video
        cy.get('#button-open-stimulus-98').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98');

        // Administrator clicks on "Collective statistics" and sees line charts of
        // emotions over time per stimulus video
        cy.get('#button-collective-stats').click();
        cy.url().should('include', 'https://faceanalyzer.plavy.me/stimuli/98/statistics');
    })

})
