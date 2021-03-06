import { Settings } from '../settings/Settings';
import { IssueIterator } from './IssueIterator';

export class TextMessage {

    private readonly settings: Settings;
    private readonly text: string;

    constructor(settings: Settings, text: string) {
        this.text = text;
        this.settings = settings;
    }

    public async hasIssues(): Promise<boolean> {
        return !this.issueIterator().next().done;
    }

    public async linkIssues(): Promise<string> {
        let text = this.text;
        let offset = 0;

        for (const issue of this.issueIterator()) {
            const lengthBeforeReplacing = text.length;
            const issueIndex = issue!.index;
            const issueText = issue!.text;
            text = textBefore(issueIndex)
                + this.markdownIssueLink(issueText)
                + textAfter(issueIndex + issueText.length);
            offset += text.length - lengthBeforeReplacing;
        }
        return text;

        function textBefore(index: number) {
            return text.substr(0, offset + index);
        }

        function textAfter(index: number) {
            return text.substr(offset + index);
        }
    }

    private issueIterator() {
        return new IssueIterator(
            this.text,
            this.buildIssuePattern(),
            Settings.EXCLUDE_PATTERNS,
            this.settings.maxSearchAttempts);
    }

    private markdownIssueLink(issueText: string) {
        return `[${issueText}](${this.settings.baseUrl}/issue/${issueText})`;
    }

    private buildIssuePattern() {
        return Settings.POSITIVE_LOOKBEHIND + this.settings.issuePattern + Settings.POSITIVE_LOOKAHEAD;
    }
}
