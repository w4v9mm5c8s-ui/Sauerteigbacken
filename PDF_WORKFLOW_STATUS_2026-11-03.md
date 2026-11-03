# PDF workflow verification, 3 November 2026

Source: Sauerteigbrot.pdf, 41 pages, Library file libfile_8a32be10ca348191adb4c85733bee8da.

This change repairs actual paths through the calculator and planner:
- Gärzeiten form sends an array of flours, resolving its runtime exception.
- Catalog flour codes now use the 27-table canonical names, enabling suggestions and search.
- Existing recipe soakers retain seed mass, reserved water and quantities when scaled; seeds are listed in recipe details and shopping.
- Scaled water balance includes every mass field and salt. Recorded hydration uses the complete water balance.
- Brew preparation, adjustable cooling time and a temperature check are included in the schedule.
- Cold proof mode stays cold even if warm and cold durations happen to match; unavailable cold mode fails clearly.
- Multiple PDF oven loads preheat once.
- Automatically populated starter time clears when temperature leaves the PDF table.
- Basket preview scales per loaf and includes extras.

Validation: npm run build, 199 passing tests, including rendered-form-to-planner regression cases. Browser execution could not be completed: Playwright browser download returned an invalid archive. No claim of iPhone or email end-to-end verification.

Still not a complete PDF acceptance:
- The concurrent update adds PDF example schedules. A complete recipe-by-recipe review, especially unknown timing/salt quantities and conflicting source water quantities, remains open.
- Teaching diagrams are currently static, not fully interactive lessons.
- Full authenticated save, delivered email callback, notification and photo-analysis flows need end-to-end verification.
- Scheduling multiple active operations at the same moment still needs conflict resolution, especially parallel preparation stages.
- Generated instructions must be reviewed against recipe-specific steps (e.g. cold bulk fermentation before shaping).
