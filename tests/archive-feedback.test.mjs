import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyFeedback,
  classifyTone,
  extractWordDocument,
  extractWordFeedback,
} from "../lib/archive-feedback.ts";

test("Word comments remain attached to the exact marked words", () => {
  const documentXml = `
    <w:document xmlns:w="urn:test"><w:body><w:p>
      <w:r><w:t>Keep </w:t></w:r>
      <w:commentRangeStart w:id="7"/>
      <w:r><w:t>this exact phrase</w:t></w:r>
      <w:commentRangeEnd w:id="7"/>
      <w:r><w:commentReference w:id="7"/></w:r>
      <w:r><w:t> in context.</w:t></w:r>
    </w:p></w:body></w:document>`;
  const commentsXml = `
    <w:comments xmlns:w="urn:test">
      <w:comment w:id="7" w:author="Tutor"><w:p><w:r><w:t>Add more evidence here.</w:t></w:r></w:p></w:comment>
    </w:comments>`;
  const document = extractWordDocument(documentXml);
  const comments = extractWordFeedback(commentsXml, document.anchors);

  assert.equal(comments.length, 1);
  assert.equal(comments[0].anchorText, "this exact phrase");
  assert.equal(comments[0].commentText, "Add more evidence here.");
  assert.equal(comments[0].category, "evidence");
  assert.equal(comments[0].tone, "improve");
});

test("feedback labels are deterministic and do not rewrite tutor wording", () => {
  const wording = "A clear introduction that establishes context.";
  assert.equal(classifyFeedback(wording), "structure");
  assert.equal(classifyTone(wording), "strength");
  assert.equal(wording, "A clear introduction that establishes context.");
});
