"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepFinder = void 0;
exports.formatDuplicateStepsMessage = formatDuplicateStepsMessage;
const paths_1 = require("../utils/paths");
const stepRegistry_1 = require("./stepRegistry");
const utils_1 = require("../utils");
class StepFinder {
    constructor(config) {
        this.config = config;
    }
    findDefinitions(keywordType, stepText, tags) {
        let definitions = this.matchByText(stepRegistry_1.stepDefinitions, stepText);
        if (this.config.matchKeywords) {
            definitions = this.filterByKeyword(definitions, keywordType);
        }
        if (tags) {
            definitions = this.filterByTags(definitions, tags);
        }
        return definitions;
    }
    matchByText(definitions, stepText) {
        return definitions
            .map((definition) => definition.matchStepText(stepText)) // prettier-ignore
            .filter(utils_1.toBoolean);
    }
    filterByKeyword(matchedDefinitions, keywordType) {
        return matchedDefinitions.filter(({ definition }) => definition.matchesKeywordType(keywordType));
    }
    filterByTags(matchedDefinitions, tags) {
        return matchedDefinitions.filter(({ definition }) => definition.matchesTags(tags));
    }
}
exports.StepFinder = StepFinder;
function formatDuplicateStepsMessage(matchedDefinitions, stepTextWithKeyword, stepLocation) {
    const variants = matchedDefinitions.map(({ definition }) => {
        const file = definition.uri ? (0, paths_1.relativeToCwd)(definition.uri) : '';
        return `  - ${definition.keyword} '${definition.patternString}' # ${file}:${definition.line}`;
    });
    return [
        `Multiple definitions matched scenario step.`,
        `Step: ${stepTextWithKeyword} # ${stepLocation}`,
        ...variants,
    ].join('\n');
}
//# sourceMappingURL=finder.js.map