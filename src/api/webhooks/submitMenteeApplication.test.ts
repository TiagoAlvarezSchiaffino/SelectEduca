import { expect } from 'chai';
import { submit } from './submitMenteeApplication';
import User from '../database/models/User';

const inputApplication = {
  "form": "FBTWTe",
  "form_name": "Scholarship Application Form",
  "entry": {
    "token": "4xXItIN1",
    "serial_number": 141,
    "field_104": "Ding Yi",
    "field_57": "Female",
    "field_110": "",
    "field_106": "WeChat ID",
    "field_113": "test1@email.com",
    "field_61": "",
    "field_165": "Some Foundation: Some ID",
    "field_149": "Full-time College Associate",
    "field_161": "Yes",
    "field_107": "School Name",
    "field_108": "Major",
    "field_167": 2008,
    "field_169": 2009,
    "field_120": "",
    "field_158": "",
    "field_124": "",
    "field_111": "",
    "field_168": "Province City Primary School Name\nProvince City Middle School Name\nProvince City High School Name",
    "field_156": "Resume Text",
    "field_162": [
      "https://some.url1"
    ],
    "field_155": "Occupational Website URL",
    "field_133": 123,
    "field_134": 456,
    "field_135": "Research List",
    "field_136": [
      "https://some.url2"
    ],
    "field_163": "Paper List",
    "field_164": "Awards",
    "field_139": "Different Quality",
    "field_140": "Proud Experience",
    "field_157": "Community Work",
    "field_154": "",
    "field_141": "",
    "field_144": "Ideal",
    "field_145": "Influence",
    "field_160": [],
    "field_121": "Residence Registration",
    "field_119": "Rural",
    "field_112": [
      {
        "statement": "Name",
        "dimensions": {
          "Member One": "Member One",
          "Member Two": "Member Two"
        }
      },
      {
        "statement": "Age",
        "dimensions": {
          "Member One": "Age One",
          "Member Two": "Age Two"
        }
      },
      {
        "statement": "Relationship with You",
        "dimensions": {
          "Member One": "Relationship One",
          "Member Two": "Relationship Two"
        }
      },
      {
        "statement": "Occupation",
        "dimensions": {
          "Member One": "Occupation One",
          "Member Two": "Occupation Two"
        }
      },
      {
        "statement": "Work or Study Unit",
        "dimensions": {
          "Member One": "Unit One",
          "Member Two": "Unit Two"
        }
      },
      {
        "statement": "Health Condition",
        "dimensions": {
          "Member One": "Health One",
          "Member Two": "Health Two"
        }
      }
    ],
    "field_127": "678",
    "field_150": "789",
    "field_151": "234",
    "field_152": "456",
    "field_128": [
      "Self or Relatives Encountered Major Illness or Injury (Enter Specific Situation After Selection): Illness",
      "Children of Martyrs"
    ],
    "field_132": [
      "Parents or Relatives Support",
      "Part-time Job (Enter Nature of Work and Average Hours per Week After Selection): Part-time Job"
    ],
    "field_159": [
      "I guarantee the truthfulness of the information provided and have read and agree to the above 'Privacy Policy and Terms'."
    ],
    "x_field_1": "",
    "color_mark": "",
    "x_field_weixin_nickname": "",
    "x_field_weixin_gender": "",
    "x_field_weixin_country": "",
    "x_field_weixin_province_city": {},
    "x_field_weixin_openid": "",
    "x_field_weixin_unionid": "",
    "x_field_weixin_headimgurl": "",
    "creator_name": "tester@gmail.com",
    "created_at": "2023-07-21T03:36:09.016Z",
    "updated_at": "2023-07-21T03:36:09.016Z",
    "referred_from": "",
    "referred_from_associated_serial_number": null,
    "referral_users_count": null,
    "referral_link": "",
    "referral_poster_url": "",
    "distribution_red_envelope_total_amount": null
  }
};

const outputApplication = {
  "Cooperative Institution Source": "Some Foundation: Some ID",
  "Type of Enrollment": "Full-time College Associate",
  "Is Undergraduate the First Batch (First Class)?" : "Yes",
  "School Name": "School Name",
  "Major": "Major",
  "First Year of College Enrollment": 2008,
  "Expected Year of Graduation": 2009,
  "Primary, Middle, High School": "Province City Primary School Name\nProvince City Middle School Name\nProvince City High School Name",
  "Resume": "Resume Text",
  "Resume File": [
    "https://some.url1"
  ],
  "Personal Occupational Website URL (Research Group Website, LinkedIn, etc.)": "Occupational Website URL",
  "Number of Students in the Grade": 123,
  "Approximate Ranking in the Grade": 456,
  "Recent List of Various Subjects (or Upload Recent Transcript Below)": "Research List",
  "Recent Transcript (Photo or Copy)": [
    "https://some.url2"
  ],
  "Research Paper Publication Status (Including Publication Publication, Author List, Index, etc. If Already Included in Resume, Please Fill in 'See Resume')": "Paper List",
  "Awards Received (If Already Included in Resume, Please Fill in 'See Resume')": "Awards",
  "What is Your Most Unique Quality?": "Different Quality",
  "Please List One to Three Experiences or Achievements That Make You Proud.": "Proud Experience",
  "Please List and Summarize Your Organizational or Participation in Club Work, Social Activities, Community Service, etc.": "Community Work",
  "What Is Your Ideal? Why? How to Achieve It? What Difficulties May Be Encountered? How to Reduce the Risks of These Difficulties? Suggested 500 Words or More:": "Ideal",
  "What Kind of Influence Do You Hope Vision Mentors and Community Will Have on Your Academic, Life, or Future? Please Give an Example of a Specific Issue or Field You Hope the Mentor Will Help or Guide.": "Influence",
  "Residence Registration Location": "Residence Registration",
  "Residence Type": "Rural",
  "Family Members": [
    {
      "statement": "Name",
      "dimensions": {
        "Member One": "Member One",
        "Member Two": "Member Two"
      }
    },
    {
      "statement": "Age",
      "dimensions": {
        "Member One": "Age One",
        "Member Two": "Age Two"
      }
    },
    {
      "statement": "Relationship with You",
      "dimensions": {
        "Member One": "Relationship One",
        "Member Two": "Relationship Two"
      }
    },
    {
      "statement": "Occupation",
      "dimensions": {
        "Member One": "Occupation One",
        "Member Two": "Occupation Two"
      }
    },
    {
      "statement": "Work or Study Unit",
      "dimensions": {
        "Member One": "Unit One",
        "Member Two": "Unit Two"
      }
    },
    {
      "statement": "Health Condition",
      "dimensions": {
        "Member One": "Health One",
        "Member Two": "Health Two"
      }
    }
  ],
  "Annual Family Income (CNY)": "678",
  "Annual Tuition Fee after Reduction (CNY)": "789",
  "Annual Accommodation Fee after Reduction (CNY)": "234",
  "Estimated Annual Miscellaneous Study Fees and Living Expenses after Reduction (CNY)": "456",
  "Reasons for Economic Difficulties": [
    "Self or Relatives Encountered Major Illness or Injury (Enter Specific Situation After Selection): Illness",
    "Children of Martyrs"
  ],
  "Existing Economic Support": [
    "Parents or Relatives Support",
    "Part-time Job (Enter Nature of Work and Average Hours per Week After Selection): Part-time Job"
  ]
};

const inputProxiedApplication = {
  "form": "S74k0V",
  "form_name": "Proxy Application Form",
  "entry": {
    "token": "CyfYLp4B",
    "serial_number": 1,
    "field_104": "Wang Xiaohan",
    "field_57": "Male",
    "field_106": "WeChat ID2",
    "field_113": "test2@email.com",
    "field_165": "Tree Education Foundation: 12-1234",
    "field_149": "Full-time College Associate",
    "field_108": "Don't Know School",
    "field_172": "Don't Know Major",
    "field_167": 2022,
    "field_170": [
      "foo",
      "bar",
    ],
    "field_171": [
      "baz",
      "qux",
      "noz",
    ],
  }
};

const outputProxiedApplication = {
  "Other Application Materials": [
    "baz",
    "qux",
    "noz",
  ],
  "Cooperative Institution Source": "Tree Education Foundation: 12-1234",
  "First Year of College Enrollment": 2022,
  "Major": "Don't Know Major",
  "School Name": "Don't Know School",
  "Type of Enrollment": "Full-time College Associate",
  "Application Form": [
    "foo",
    "bar",
  ],
};

describe('submitMenteeApplication', () => {
  after(async () => {
    const user1 = await User.findOne({ where: { email: "test1@email.com" } });
    if (user1) await user1.destroy({ force: true });
    const user2 = await User.findOne({ where: { email: "test2@email.com" } });
    if (user2) await user2.destroy({ force: true });
  });

  it('should submit application', async () => {
    await submit(inputApplication, "baseurl");
    const user = await User.findOne({ where: { email: "test1@email.com" } });
    expect(user).is.not.null;
    expect(user?.pinyin).is.equal("sa");
    expect(user?.sex).is.equal("Female");
    expect(user?.wechat).is.equal("WeChat ID");
    expect(user?.menteeApplication).is.deep.equal(outputApplication);
  });

  it('should submit proxied application', async () => {
    await submit(inputProxiedApplication, "baseurl");
    const user = await User.findOne({ where: { email: "test2@email.com" } });
    expect(user).is.not.null;
    expect(user?.pinyin).is.equal("dsa");
    expect(user?.sex).is.equal("Male");
    expect(user?.wechat).is.equal("WeChat ID2");
    expect(user?.menteeApplication).is.deep.equal(outputProxiedApplication);
  });
});