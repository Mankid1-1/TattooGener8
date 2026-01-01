
import json
from playwright.sync_api import sync_playwright

def verify_design_grid_item(page):
    # Mock data to simulate portfolio state
    mock_state = {
        "concept": "Test Concept",
        "placement": "Arm / Sleeve",
        "style": "Traditional",
        "designs": [
            {
                "id": "1",
                "originalUrl": "https://via.placeholder.com/300x400",
                "modifiedUrl": None,
                "promptUsed": "A fierce tiger roaring",
                "fullPrompt": "A fierce tiger roaring, traditional style",
                "placement": "Arm / Sleeve",
                "createdAt": 1234567890
            }
        ],
        "lastUpdated": 1234567890,
        "mode": "Single Piece",
        "projectLayers": []
    }

    # Inject mock state into localStorage
    page.goto("http://localhost:3000")
    page.evaluate(f"localStorage.setItem('tc_portfolio_state', '{json.dumps(mock_state)}');")
    page.reload()

    # Wait for the design grid item to appear
    page.wait_for_selector("img[alt='Design 1: A fierce tiger roaring']")

    # Focus on the button to trigger the overlay
    # Since the button is inside the overlay which is hidden, we might need to force focus or simulate tab
    page.keyboard.press("Tab")
    # Tabbing might land on "Skip to content" first, then other elements.
    # Let's target the button directly and focus it.

    # Find the button by its aria-label (which we didn't change, but it's "Inspect design 1")
    button = page.locator("button[aria-label='Inspect design 1']")
    button.focus()

    # Take a screenshot
    page.screenshot(path="verification/design_grid_focus.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        try:
            verify_design_grid_item(page)
            print("Verification script ran successfully.")
        except Exception as e:
            print(f"Verification script failed: {e}")
        finally:
            browser.close()
