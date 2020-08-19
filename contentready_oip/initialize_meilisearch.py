""""
Initialize meilisearch and create indexes
"""
import json
import meilisearch
import frappe

INDEX_TO_ADD = ['Problem', 'Solution', 'User Profile']
CLIENT = meilisearch.Client('https://meilisearch.onrender.com', 'test123')

def refactor_sectors_list(problem_dict):
    """
    Refactor sector to list of strings.
    """
    try:
        _sectors = problem_dict['sectors']
        problem_dict['meili_sectors'] = []

        for sctr in _sectors:
            problem_dict['meili_sectors'].append(sctr["sector"])
    except Exception as _e:
        print(str(_e))

    return problem_dict

def replace_space(name):
    """
    replace white space with _
    """
    name_list = name.split(" ")
    if len(name_list) > 1:
        name = "_".join(name_list)

    return name.lower()


def get_detailed_doctype(doc_name):
    """
    Get doctype details from frappe and arrange as per meilisearch requirement.
    """
    detailed_doc_list = []
    doc_list = frappe.get_list(doc_name)

    # remove guest from user list
    if doc_name.lower().startswith('user'):
        guest_index = next((item for item in doc_list if item['name'] == 'Guest'), False)
        if guest_index:
            doc_list.remove(guest_index)

    for doc in doc_list:
        detail_doc = frappe.get_doc(doc_name, doc)
        try:
            doc_dict = detail_doc.as_dict()
            if doc_name.lower() == "problem" or "solution":
                doc_dict = refactor_sectors_list(doc_dict)
            detailed_doc_list.append(doc_dict)
        except Exception as _e:
            print(str(_e))

    return json.dumps(detailed_doc_list, default=str)


def add_index_if_not_exist(index_name):
    """
    Create index if doesn't exist.
    Set primaryKey as 'name'
    """
    index = CLIENT.get_indexes()
    idx_name = replace_space(index_name)
    does_index_exist = next(
        (item for item in index if item['name'] == idx_name), False)

    if not does_index_exist:
        index = CLIENT.create_index(
            uid=idx_name, options={
                'primaryKey': 'name'
            })
        add_documents_to_index(index_name)


def add_documents_to_index(idx_name):
    """
    Add list of dictionary to the index created
    """
    meili_name = replace_space(idx_name)
    document = get_detailed_doctype(idx_name)
    json_doc = json.loads(document)
    CLIENT.get_index(meili_name).add_documents(json_doc)


def clear_all_data(idx_name):
    """
    Remove the provided index from meilisearch
    """
    idx_name = replace_space(idx_name)
    CLIENT.get_index(idx_name).delete_all_documents()
    CLIENT.get_index(idx_name).delete()

def reset_meilisearch(doc_name):
    """
    Delete and re-Initialize the index and documents
    """
    clear_all_data(doc_name)
    add_index_if_not_exist(doc_name)

def main_fn():
    """
    Entry point for the file.
    """
    for doc_name in INDEX_TO_ADD:
        clear_all_data(doc_name)
        add_index_if_not_exist(doc_name)