"""
Please set environment variable INTEGRATION_AUTH_TOKEN for beta.yuanjian.org
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
params = {"key": "", "excludeTranscriptsWithKey": "xxx_llm_1000"}
headers_get = {"Authorization": "Bearer {}".format(os.environ['INTEGRATION_AUTH_TOKEN'])}
headers_post = ["Authorization: Bearer {}".format(os.environ['INTEGRATION_AUTH_TOKEN']),
                "Content-Type: application/x-www-form-urlencoded"]  #


def get_list(url, headers, params):
    """
    api
    """
    r = requests.get(url, headers=headers, params={"input": json.dumps(params)}).json()

    return r["result"]["data"]


def post_summary(url, headers, transcriptId, summaryKey, result_summary):
    """
    api
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
    INPUT:
        txt:
        name:
        person_dict:{}
    RETURN：
        df:
        {dialogs: ABCDE
        time: }
    """

    tm = []
    txtAB = []
    for t in txt:
        if len(t.strip()) > 0:
            tm.append(t[t.find("("):t.find(")") + 1])  #
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
    section, section
    INPUT:
        df: preprocess()df
        section_len: section
        part_len: 
    RETURN:
        df_s: section
        summary_total: 
        first_summary：
      summary_bytheme: 
    """
    # section

    section = ''
    sections = []
    tm_section = []
    tm_start = df.iloc[0].time
    for i in range(0, df.shape[0]):
        if i % 2 == 0 and i + 1 < df.shape[0]:
            section = section + df.dialogs[i] + df.dialogs[i + 1]

            if len(section) < section_len:  # section500
                continue
            else:
                tm_end = df.iloc[i + 1].time  # section end time
                sections.append(section)
                tm_section.append(tm_start + "--" + tm_end)
                section = ""
                tm_start = df.iloc[i + 2].time  # next section start time
    df_s = pd.DataFrame({"tm_section": tm_section, "dialogue_section": sections})

    # section

    summary = []
    for s in sections:
        prompt = ":" + s + ":"
        response, history = model.chat(tokenizer, prompt, history=[])
        summary.append(response)

    df_s["section_summary"] = summary

    # section，part_len

    text = ""
    part = []
    for i in summary:
        text = text + i
    for i in range(len(text) // part_len):
        part.append(text[i * part_len:(i + 1) * part_len])

    summary_total = ""
    for p in part:
        prompt = ":" + p + ":"
        response, _ = model.chat(tokenizer, prompt, history=[])
        summary_total += response

    #
    prompt = "list:" + summary_total
    response, _ = model.chat(tokenizer, prompt, history=[])
    first_summary = response
    print(first_summary)

    #
    summary_bytheme = []
    for l in first_summary.split("\n"):
        print(l)
        prompt = "{}{}:".format(summary_total, l[l.find(".") + 1:])
        response, _ = model.chat(tokenizer, prompt, history=[])
        summary_bytheme.append(l)
        summary_bytheme.append(response)
        print(response)
        print("\n")

    return df_s, summary_total, summary_bytheme


if __name__ == '__main__':

    # transcript list

    data = get_list(url_get, headers_get, params)  ##transcriptId,summary
    # print (data)

    #
    for d in data:

        transid = d["transcriptId"]  # transciptId
        txt = d["summary"].split('\n')  #

        #
        name = set()
        for t in txt[:1000]:
            if len(t.strip()) > 0:
                name.add(t[:t.find("(")].strip())
        name = list(name)

        # dict
        person = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S",
                  "T"]  # 20
        person_dict = {}
        for i in range(len(name)):
            person_dict[name[i]] = person[i]
        print(person_dict)

        #
        # section_len = 500
        df = preprocess(txt, name, person_dict)

        for part_len in [1000]:
            for section_len in [500]:
                df_s, summary_total, summary_bytheme = section_summarize(df, section_len, part_len)
                result_summary = "\n:\n" + "\n".join(summary_bytheme)

                for n in name:  #
                    result_summary = re.sub(person_dict[n], "{{" + n + "}}", result_summary)

                #
                summaryKey = "xxx_llm_" + str(part_len)

                post_summary(url_post, headers_post, transid, summaryKey, result_summary)
                print("{} with {} is done".format(transid, summaryKey))