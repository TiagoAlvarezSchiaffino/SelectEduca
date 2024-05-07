"""
Please set environment variable INTEGRATION_AUTH_TOKEN
"""

import requests
import pycurl
import json
import pandas as pd
import re
import os
from urllib.parse import urlencode

import random
import numpy as np
import torch

seed = 0
random.seed(seed)
np.random.seed(seed)
torch.manual_seed(seed)
torch.cuda.manual_seed(seed)
torch.backends.cudnn.deterministic = True

from transformers import AutoTokenizer, AutoModel

MODEL_NAME = "THUDM/chatglm-6b"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
model = AutoModel.from_pretrained(MODEL_NAME, trust_remote_code=True).half().cuda()
model = model.eval()

url_get = ""
url_post = ''
headers_get = {"Authorization": "Bearer {}".format(os.environ['INTEGRATION_AUTH_TOKEN'])}
headers_post = ["Authorization: Bearer {}".format(os.environ['INTEGRATION_AUTH_TOKEN']),
                "Content-Type: application/x-www-form-urlencoded"]  #


def get_list(url, headers, params):
    """
    Call API to get original documents
    """
    r = requests.get(url, headers=headers, params={"input": json.dumps(params)}).json()

    return r["result"]["data"]


def post_summary(url, headers, transcriptId, summaryKey, result_summary):
    """
    Call API to upload text summary
    """

    post_data = {'transcriptId': transcriptId,
                 'summaryKey': summaryKey,
                 'summary': result_summary}

    c = pycurl.Curl()
    c.setopt(c.URL, url)
    c.setopt(pycurl.HTTPHEADER, headers)

    postfields = urlencode(post_data)
    c.setopt(c.POSTFIELDS, postfields)

    data = []

    def collect_data(chunk):
        data.append(chunk)

    c.setopt(c.WRITEFUNCTION, collect_data)

    c.perform()
    c.close()

    return data


def preprocess(txt, name, person_dict):
    """
    Read the speaker from the text and mark it: ABCDE, etc., up to 20 speakers.
    INPUT:
        txt: Original text
        name: Speaker
        person_dict: {Speaker: Mark}
    RETURN：
        df:
        {dialogs: Original dialogue marked ABCDE, etc., removing blank lines
        time: Original dialogue time}

    """

    tm = []
    txtAB = []
    for t in txt:
        if len(t.strip()) > 0:
            tm.append(t[t.find("("):t.find(")") + 1])  # Time
            flag = 0
            for n in name:
                if t[:t.find("(")].strip().find(n) >= 0:
                    txtAB.append(re.sub(n + r'(\(.+\))', person_dict[n], t.strip()))
                    flag = 1
                    break
            if flag == 0:
                print(t)
    df = pd.DataFrame({"dialogs": txtAB, "time": tm})

    return df


def section_summarize(df, section_len, part_len):
    """
    Divide section, section summary, full text summary, full text topic extraction
    INPUT:
        df: preprocess() result df
        section_len: section length
        part_len: Unit length used for full text summary
    RETURN:
        df_s: Time, summary, and topic of each section
        summary_total: Full text summary
        first_summary: Full text summary topic
        summary_bytheme: Summary by topic

    """
    # Divide section

    section = ''
    sections = []
    tm_section = []
    tm_start = df.iloc[0].time
    for i in range(0, df.shape[0]):
        if i % 2 == 0 and i + 1 < df.shape[0]:
            section = section + df.dialogs[i] + df.dialogs[i + 1]

            if len(section) < section_len:  # If the cumulative number of dialogue characters in the section is less than 500, continue to merge the next round of dialogue
                continue
            else:
                tm_end = df.iloc[i + 1].time  # section end time
                sections.append(section)
                tm_section.append(tm_start + "--" + tm_end)
                section = ""
                tm_start = df.iloc[i + 2].time  # next section start time
    df_s = pd.DataFrame({"tm_section": tm_section, "dialogue_section": sections})

    # Generate section summary

    summary = []
    for s in sections:
        prompt = "Please summarize the following sentence in English:" + s + "Summary:"
        response, history = model.chat(tokenizer, prompt, history=[])
        summary.append(response)

    df_s["section_summary"] = summary

    # Merge section summaries and generate summaries for every part_len characters

    text = ""
    part = []
    for i in summary:
        text = text + i
    for i in range(len(text) // part_len):
        part.append(text[i * part_len:(i + 1) * part_len])

    summary_total = ""
    for p in part:
        prompt = "Please summarize the following sentence in English:" + p + "Summary:"
        response, _ = model.chat(tokenizer, prompt, history=[])
        summary_total += response

    # Extract full text topics
    prompt = "Please use the list format to list the topic words extracted from the following sentence:" + summary_total
    response, _ = model.chat(tokenizer, prompt, history=[])
    first_summary = response
    print(first_summary)

    # Generate summaries by topic words
    summary_bytheme = []
    for l in first_summary.split("\n"):
        print(l)
        prompt = "Please extract the part describing {} in the original text {}:".format(summary_total, l[l.find(".") + 1:])
        response, _ = model.chat(tokenizer, prompt, history=[])
        summary_bytheme.append(l)
        summary_bytheme.append(response)
        print(response)
        print("\n")

    return df_s, summary_total, summary_bytheme, first_summary


if __name__ == '__main__':
    for part_len in [1000, 1200, 1500]:
        for write_mode in ["short", "long"]:
            # Get transcript list
            summaryKey = "{}_summary_{}".format(write_mode, part_len)
            params = {"key": "Original text", "excludeTranscriptsWithKey": summaryKey}
            data = get_list(url_get, headers_get, params)  ##transcriptId,summary
            # print (data)

            # Summary generation
            for d in data:

                transid = d["transcriptId"]  # transciptId
                txt = d["summary"].split('\n')  # Original text

                # Identify speaker, up to 20 speaker names, using ABCDE to represent
                name = set()
                for t in txt[:1000]:
                    if len(t.strip()) > 0:
                        name.add(t[:t.find("(")].strip())
                name = list(name)

                # Person dict
                person = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S",
                          "T"]  # 20
                person_dict = {}
                for i in range(len(name)):
                    person_dict[name[i]] = person[i]
                print(person_dict)

                # Summary processing
                # section_len = 500
                df = preprocess(txt, name, person_dict)

                for section_len in [500]:
                    df_s, summary_total, summary_bytheme, first_summary = section_summarize(df, section_len, part_len)
                    if write_mode == "short":
                        result_summary = "\nText summary:\n" + "\n".join(summary_bytheme)
                    else:
                        result_summary = "Discussion topic:\n{}\n".format(first_summary) + "\nText summary:\n" + summary_total

                    for n in name:  # Replace original person name
                        result_summary = re.sub(person_dict[n], "{{" + n + "}}", result_summary)
                    # Upload summary
                    post_summary(url_post, headers_post, transid, summaryKey, result_summary)
                    print("{} with {} is done".format(transid, summaryKey))