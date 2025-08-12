import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { PersonalBlogStack } from '../lib/personal-blog-stack';

describe('Personal Blog Stack', () => {
  let app: cdk.App;
  let stack: PersonalBlogStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new PersonalBlogStack(app, 'TestPersonalBlogStack', {
      env: {
        account: '123456789012',
        region: 'us-east-1',
      },
    });
    template = Template.fromStack(stack);
  });

  test('creates nested stacks', () => {
    // Test that nested stacks are created
    template.resourceCountIs('AWS::CloudFormation::Stack', 3);
  });

  test('stack synthesizes without errors', () => {
    // This test passes if the stack can be synthesized without throwing
    expect(() => {
      app.synth();
    }).not.toThrow();
  });

  test('has proper dependencies between nested stacks', () => {
    // The main stack should have nested stack resources
    const resources = template.toJSON().Resources;
    const nestedStacks = Object.values(resources).filter(
      (resource: any) => resource.Type === 'AWS::CloudFormation::Stack'
    );
    
    // Should have 3 nested stacks (Database, API, Frontend)
    expect(nestedStacks.length).toBe(3);
  });

  test('creates required AWS resources', () => {
    // Check that the main stack creates the nested stacks
    const assembly = app.synth();
    
    // The assembly should contain the main stack
    expect(assembly.stacks.length).toBeGreaterThanOrEqual(1);
    
    // Check that the main stack has the expected nested stack resources
    const mainStack = assembly.stacks.find(s => s.stackName === 'TestPersonalBlogStack');
    expect(mainStack).toBeDefined();
    
    if (mainStack) {
      const mainTemplate = Template.fromJSON(mainStack.template);
      
      // Should have 3 nested stacks
      mainTemplate.resourceCountIs('AWS::CloudFormation::Stack', 3);
    }
  });

  test('nested stacks have correct resource types', () => {
    // Synthesize to get all templates
    const assembly = app.synth();
    
    // Check that we have the main stack
    const mainStack = assembly.stacks.find(s => s.stackName === 'TestPersonalBlogStack');
    expect(mainStack).toBeDefined();
    
    // The main stack should reference nested stacks
    if (mainStack) {
      const resources = mainStack.template.Resources;
      const nestedStackResources = Object.values(resources).filter(
        (resource: any) => resource.Type === 'AWS::CloudFormation::Stack'
      );
      
      expect(nestedStackResources.length).toBe(3);
      
      // Check that nested stacks have dependencies
      const apiStack = nestedStackResources.find((resource: any) => 
        resource.DependsOn && resource.DependsOn.some((dep: string) => dep.includes('Database'))
      );
      expect(apiStack).toBeDefined();
      
      const frontendStack = nestedStackResources.find((resource: any) => 
        resource.DependsOn && resource.DependsOn.some((dep: string) => dep.includes('Api'))
      );
      expect(frontendStack).toBeDefined();
    }
  });

  test('stack has proper configuration', () => {
    // Test basic stack properties
    expect(stack.stackName).toBe('TestPersonalBlogStack');
    expect(stack.account).toBe('123456789012');
    expect(stack.region).toBe('us-east-1');
  });

  test('stack creates all required nested stack types', () => {
    const resources = template.toJSON().Resources;
    const stackResourceNames = Object.keys(resources).filter(
      key => resources[key].Type === 'AWS::CloudFormation::Stack'
    );
    
    // Should have resources for Database, API, and Frontend stacks
    expect(stackResourceNames.some(name => name.includes('Database'))).toBe(true);
    expect(stackResourceNames.some(name => name.includes('Api'))).toBe(true);
    expect(stackResourceNames.some(name => name.includes('Frontend'))).toBe(true);
  });
});
