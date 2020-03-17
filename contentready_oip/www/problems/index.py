import frappe
from contentready_oip import api

def get_context(context):
    r = api.get_filters()
    print(r)
    context.update(r)
    if frappe.session.user != 'Guest':
        context.problems = api.get_filtered_content('Problem', context.filter_location_lat, context.filter_location_lng, context.filter_location_range, context.filter_sectors)