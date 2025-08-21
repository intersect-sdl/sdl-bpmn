/**
 * Test constants and utilities for BPMN testing
 */

// Sample valid BPMN XML for testing
export const VALID_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>SequenceFlow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="Test Task">
      <bpmn:incoming>SequenceFlow_1</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>SequenceFlow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="SequenceFlow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="SequenceFlow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="270" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

// Invalid BPMN XML for error testing
export const INVALID_BPMN_XML = `<not-bpmn>This is not valid BPMN</not-bpmn>`;

// Malformed XML for testing
export const MALFORMED_XML = `<bpmn:definitions>Missing closing tag`;

// Empty BPMN for testing
export const EMPTY_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
  id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
  </bpmn:process>
</bpmn:definitions>`;

// Test utility functions
export function createMockResponse(content: string, options: ResponseInit = {}): Response {
  const defaultOptions: ResponseInit = {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'application/xml',
      'Content-Length': content.length.toString()
    }
  };

  return new Response(content, { ...defaultOptions, ...options });
}

export function createMockFetch(response: Response): typeof fetch {
  return async () => response;
}

export function expectValidSvg(svg: string): void {
  if (!svg.includes('<svg')) {
    throw new Error('Expected SVG to contain <svg tag');
  }
  if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    throw new Error('Expected SVG to contain SVG namespace');
  }
}

export function expectOrnlTheming(content: string): void {
  if (!content.includes('#00662C')) {
    throw new Error('Expected content to contain ORNL Green (#00662C)');
  }
}
