import React, { useCallback, useEffect, useState } from "react";
import { Button, Content, Delete, Level, Modal } from "trunx";
import TemplateFile from "../../model/TemplateFile";

const TemplatePreview: React.FC<{
  template: TemplateFile | undefined;
  isPreviewActive: boolean;
  onClickClose: React.MouseEventHandler;
}> = ({ template, isPreviewActive, onClickClose }) => {
  const [isFrontPreview, setIsFrontPreview] = useState(true);
  const [isBackPreview, setIsBackPreview] = useState(false);
  const [previewDocument, setPreview] = useState("Loading...");

  const buildSourceDocument = useCallback(() => {
    if (!template) {
      return "<p>Error loading document</p>";
    }
    if (isFrontPreview) {
      return `<style scoped>${template.styling}</style>\n<div class="toggle">${template.front}</div>`;
    } else if (isBackPreview) {
      return `<style scoped>${template.styling}</style>\n<div class="toggle">${template.back}</div>`;
    }
    return "...";
  }, [isBackPreview, isFrontPreview, template]);

  useEffect(() => {
    if (template) {
      setPreview(buildSourceDocument());
    }
  }, [buildSourceDocument, template, isFrontPreview, isBackPreview]);

  useEffect(() => {
    if (isBackPreview) {
      setIsFrontPreview(false);
    }
  }, [isBackPreview]);

  useEffect(() => {
    if (isFrontPreview) {
      setIsBackPreview(false);
    }
  }, [isFrontPreview]);

  console.log("TODO: reduce re-render", false);

  return (
    <>
      <Modal isActive={isPreviewActive}>
        <Modal.Background
          style={{ background: "white" }}
          onClick={onClickClose}
        />
        <Modal.Card>
          <Modal.Card.Head>
            <Level>
              <Level.Left>
                <Level.Item>
                  <Modal.Card.Title>Template Preview</Modal.Card.Title>
                </Level.Item>
              </Level.Left>
              <Level.Right>
                <Level.Item>
                  <Delete onClick={onClickClose} />
                </Level.Item>
              </Level.Right>
            </Level>
          </Modal.Card.Head>
          <Modal.Card.Body>
            <Content>
              <div className="control m-2">
                <label className="radio">
                  <input
                    checked={isFrontPreview}
                    onChange={(event) =>
                      setIsFrontPreview(event?.target.checked)
                    }
                    className="m-2"
                    type="radio"
                    name="front-preview"
                  />
                  Front Preview
                </label>
                <label className="radio">
                  <input
                    checked={isBackPreview}
                    onChange={(event) => setIsBackPreview(event.target.checked)}
                    className="m-2"
                    type="radio"
                    name="back-preview"
                  />
                  Back Preview
                </label>
                <div className="mt-2">
                  <div>
                    <iframe
                      height="600vh"
                      width="648px"
                      title="preview"
                      className="toggle"
                      srcDoc={previewDocument}
                    ></iframe>
                  </div>
                </div>
              </div>
            </Content>
          </Modal.Card.Body>
          <Modal.Card.Foot>
            <Button onClick={onClickClose}>Done</Button>
          </Modal.Card.Foot>
        </Modal.Card>
      </Modal>
    </>
  );
};

export default TemplatePreview;
