describe("Navigation Test", () => {
	beforeEach(() => {
		cy.login();
		// Visit a route in order to allow Cypress to actually set the cookie
		cy.visit("/");
	})

	it("can navigate to coachees", () => {
		cy.visit("/coachees");
		cy.findAllByText("Senior Coach Responsibilities").should("be.visible");
	});
});