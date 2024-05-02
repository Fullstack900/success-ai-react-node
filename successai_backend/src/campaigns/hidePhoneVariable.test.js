import Variables from "./enum/campaign-variables";

describe('test test', () => {
  
  it('should fail if phoneNumber is present in Variables', async () => {
    const containsPhoneNumber = Variables.includes('phoneNumber');
    expect(containsPhoneNumber).toBe(false);
  });
 
  it('should pass if Variables exactly match the specified values', async () => {
    const expectedValues = [
      'email',
      'firstName',
      'lastName',
      'companyName',
      'title',
      'website',
      'location',
      'signature',
      'senderName',
    ];
    expect(Variables).toEqual(expectedValues);
  });

});
