Feature: Registration and deletion flow for admin roles

  Scenario Outline: Registration and deletion for <role>
    Given I am logged in using Microsoft Entra SSO
    When I navigate to the Users section
    And I click the add users button
    And I fill and submit the popup with email "<invite_email>", role "<role_id>", and workspace "<workspace_id>"
    Then the invitation email should be sent to "<invite_email>"
    When I open Yopmail and check the inbox for "<invite_email>"
    And I click the link in the invitation email
    And I complete the registration form with:
      | First Name       | test              |
      | Last Name        | flow              |
      | Password         | Testing@123123123 |
      | Confirm Password | Testing@123123123 |
    And I submit the registration
    Then I should see a confirmation and be able to continue
    When I search for "<invite_email>" in the Users section
    Then I should see the user "test flow" with email "<invite_email>" and role "<role_text>"
    When I delete the user "<invite_email>"
    Then searching for "<invite_email>" should show "No users found."

    Examples:
      | role        | role_id | workspace_id | role_text         | invite_email         |
      | superadmin  | 1       |              | Rimo3 - Superadmin| testflow@yopmail.com |
      | admin       | 2       | 1            | Rimo3 - Admin     | testflow@yopmail.com |
      | user        | 3       | 1            | Rimo3 - User      | testflow@yopmail.com |