/**
 * Step definition class.
 */
import { Expression } from '@cucumber/cucumber-expressions';
import { PickleStepType } from '@cucumber/messages';
import { PlaywrightLocation, TestTypeCommon } from '../playwright/types';
import { PomNode } from './decorators/pomGraph';
import { MatchedStepDefinition } from './matchedStepDefinition';
export type GherkinStepKeyword = 'Unknown' | 'Given' | 'When' | 'Then';
export type StepPattern = string | RegExp;
export type AnyFunction = (...args: any[]) => unknown;
export type ProvidedStepOptions = {
    tags?: string;
};
export type StepDefinitionOptions = {
    keyword: GherkinStepKeyword;
    pattern: StepPattern;
    fn: AnyFunction;
    location: PlaywrightLocation;
    customTest?: TestTypeCommon;
    pomNode?: PomNode;
    worldFixture?: string;
    providedOptions?: ProvidedStepOptions;
    defaultTags?: string;
};
export declare class StepDefinition {
    #private;
    private options;
    constructor(options: StepDefinitionOptions);
    get keyword(): GherkinStepKeyword;
    get pattern(): StepPattern;
    get fn(): AnyFunction;
    get uri(): string;
    get line(): number;
    get customTest(): TestTypeCommon | undefined;
    get pomNode(): PomNode | undefined;
    get worldFixture(): string | undefined;
    get expression(): Expression;
    get patternString(): string;
    /**
     * Decorator steps have pom node.
     */
    isDecorator(): this is this & {
        pomNode: PomNode;
    };
    /**
     * New cucumber-style steps have worldFixture in step config.
     */
    isCucumberStyle(): this is this & {
        worldFixture: string;
    };
    /**
     * Tries to match step text.
     * Returns MatchedStepDefinition in case of success.
     */
    matchStepText(stepText: string): MatchedStepDefinition | undefined;
    matchesTags(tags: string[]): boolean;
    matchesKeywordType(keywordType: PickleStepType | undefined): boolean;
    private buildTagsExpression;
}
//# sourceMappingURL=stepDefinition.d.ts.map