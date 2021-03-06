# -*- coding: utf-8 -*-
# Copyright (c) 2020, ContentReady and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
# import frappe
from frappe.model.document import Document

class Sector(Document):
	def autoname(self):
		self.name = self.title.strip().replace(' - ','_').replace('-','_').replace('/','_').replace(' ', '_').lower()
