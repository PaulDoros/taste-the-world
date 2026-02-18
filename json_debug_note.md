The error `U+0000 thru U+001F is not allowed in string` means the AI returned a JSON string with unescaped control characters (likely newlines inside a string value).
We need to sanitize the string before `JSON.parse`.
Regex: `.replace(/[\x00-\x1F\x7F-\x9F]/g, "")` might be too aggressive if it removes valid newlines.
Better: `.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")` inside string values?
Or just use a robust JSON parser or clean the string of specific bad chars.
Often AI returns markdown code blocks `json ... `. We should strip those too.
