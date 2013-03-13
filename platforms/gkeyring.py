#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# A small Python tool for shell access to GNOME keyring. It provides
# simple querying for and creating of keyring items.
#
# Author: Kamil Páral <kamil.paral /at/ gmail /dot/ com>, 2009-2011
#
# This program is a free software, licensed under GNU AGPL 3:
# http://www.gnu.org/licenses/agpl-3.0.html

import sys, optparse, getpass
import gnomekeyring as gk

_version = '0.2.4.99'

class CLI(object):
    ''' Class providing command-line interface for GNOME keyring '''

    ITEM_TYPES = {
        'generic': gk.ITEM_GENERIC_SECRET,
        'network': gk.ITEM_NETWORK_PASSWORD,
        'note': gk.ITEM_NOTE
        }

    def __init__(self):
        self.options = None
        self.keyring = None
        self.params = {}
        self.id = None
        self.item_type = None
        self.secret = None
        self.name = None
        self.output = None

    def parse_args(self):
        ''' Parse commandline options.

        Returns False if something is wrong.
        '''

        desc=\
'''By default %prog queries the GNOME keyring for items matching specified
arguments. You can define the item exactly by --id, or search for it using
-p and/or -i.

It is important to understand that the keyring items are divided into several
types (see --type) and each contain several properties. Both the item type and
item properties can be inspected using a tool like Seahorse. Then you will know
what to query for.

Zero or more items may match your query. They will be printed out one item
a line, by default in the format:
ID [TAB] secret

You can also create a new keyring item using --set. In this case the arguments
-p and/or -i are mandatory and will be used as properties of the new item.

When a new keyring item is created, its ID is printed out on the output.'''

        parser = MyOptionParser(description=desc, version=_version)

        parser.add_option('-t', '--type', choices=CLI.ITEM_TYPES.keys(),
            default='generic', help='type of keyring item: '
            'generic, network or note [default: %default]')
        parser.add_option('-k', '--keyring', help='keyring name [default: '
            'default keyring]', dest=self.keyring)
        parser.add_option('--id', type='int', help='key ID')
        parser.add_option('-p', default='',
            metavar='PARAM1=VALUE1,PARAM2=VALUE2', dest='params',
            help='params and values of keyring item, e.g. user, server, '
            'protocol, etc.')
        parser.add_option('-i', default='',
            metavar='PARAM1=VALUE1,PARAM2=VALUE2', dest='params_int',
            help='same as -p, but values are treated as integers, not strings')

        out_group = optparse.OptionGroup(parser, 'Formatting output for '
            'querying keyring items')
        out_group.add_option('-o', '--output', default='id,secret',
            help='comma-separated list of columns to be printed on the output.'
            " Column name may include any name of item's property or keywords "
            "'id', 'secret' and 'name'. Columns will be separated by tabs. "
            "[default: %default]")
        out_group.add_option('-l', '--no-newline', action='store_true',
            help="don't output the trailing newline")
        out_group.add_option('-1', action='store_true', dest='output1',
            help="same as '--output secret --no-newline'")
        parser.add_option_group(out_group)

        set_group = optparse.OptionGroup(parser, 'Options specific for '
            'creating keyring items')
        set_group.add_option('-s', '--set', action='store_true', default=False,
            help='create a new item in the keyring instead of querying')
        set_group.add_option('-n', '--name',
            help='keyring item descriptive name [mandatory if --set]')
        set_group.add_option('-w', '--password', help='keyring item password')
        parser.add_option_group(set_group)

        set_group = optparse.OptionGroup(parser, 'Options specific for '
            'deleting keyring items')
        set_group.add_option(
            '-d', '--delete', action='store_true', default=False,
            help="delete the item in the keyring identified by '--id'")
        parser.add_option_group(set_group)

        epilog=\
"""Example usage:
$ %(prog)s --id 12
Get keyring item with ID 12 in default keyring.

$ %(prog)s -p account_name=my@jabber.org -i gajim=1 -1
Search for keyring item with property 'account_name' with value 'my@jabber.org'
and property 'gajim' with integer value '1'. Output only the secret(s).

$ %(prog)s --type network -p server=my.com,protocol=ftp --output user,secret
Search for network keyring item with 'server' and 'protocol' properties. Output
property 'user' followed by item's secret.

$ %(prog)s --set --name 'foo' -p bar=baz --keyring login
Create a new item in keyring 'login' with name 'foo' and property 'bar'.

$ %(prog)s --delete --id 12
Delete a keyring item with ID 12."""
        parser.epilog = epilog % {'prog': parser.get_prog_name()}

        (options, args) = parser.parse_args()
        self.options = options

        # ensure that the application name is correctly set
        # this must be done after parsing args, because
        # our --name option collides with gtk option --name
        import gtk

        if not gk.is_available():
            print >>sys.stderr, 'GNOME keyring is not available!'
            return False

        if not options.params and not options.params_int and \
        (options.set or not options.id):
            parser.error('Missing option -p or -i! See --help.')

        # parse string params
        try:
            tuples = options.params.split(',')
            for tupl in tuples:
                if not tupl:
                    # empty string
                    continue
                name, val = tupl.split('=',1)
                self.params[name] = val
        except ValueError, e:
            parser.error('Incorrect syntax of "-p param1=value1,'
                'param2=value2"! See --help.\nDetails:\n%s' % e)

        # parse integer params
        try:
            tuples = options.params_int.split(',')
            for tupl in tuples:
                if not tupl:
                    # empty string
                    continue
                name, val = tupl.split('=',1)
                val = int(val)
                self.params[name] = val
        except ValueError, e:
            parser.error('Incorrect syntax of "-i param1=value1,'
                'param2=value2"! See --help.\nDetails:\n%s' % e)

        if options.keyring:
            self.keyring = options.keyring
        else:
            self.keyring = gk.get_default_keyring_sync()

        if options.output1:
            options.output = 'secret'
            options.no_newline = True

        if options.set:
            if not options.name:
                parser.error('Missing --name! See --help.')
            if not options.password:
                # ask for password
                options.password = getpass.getpass()

        self.secret = options.password
        self.id = options.id
        self.name = options.name
        self.item_type = CLI.ITEM_TYPES[options.type]
        self.output = options.output.split(',')
        self.no_newline = options.no_newline

        return True

    def execute(self):
        ''' Run the interface '''

        if not self.parse_args():
            sys.exit(2)

        if self.options.set:
            ret = self.create()
        elif self.options.delete:
            ret = self.delete()
        else:
            ret = self.query()

        sys.exit(0 if ret else 5)

    def query(self):
        ''' Match keyring items from keyring.

        Return True if something was matched, False otherwise.
        '''

        results = []

        try:
            if self.id:
                info = gk.item_get_info_sync(self.keyring, self.id)
                attr = gk.item_get_attributes_sync(self.keyring, self.id)
                result = {'id': self.id, 'secret': info.get_secret(),
                          'name': info.get_display_name(), 'attr': attr}
                results.append(result)
            else:
                matches = gk.find_items_sync(self.item_type, self.params)
                for match in matches:
                    result = {'id': match.item_id, 'secret': match.secret,
                              'attr': match.attributes}
                    if 'name' in self.output:
                        # do this only when required, because it pops up
                        # one more 'allow access?' dialog
                        info = gk.item_get_info_sync(self.keyring,
                                                     match.item_id)
                        result['name'] = info.get_display_name()
                    results.append(result)
        except gk.Error:
            pass

        if not results:
            return False

        for index, result in enumerate(results):
            if index > 0:
                print

            for index2, tab in enumerate(self.output):
                if index2 > 0:
                    sys.stdout.write('\t')

                out = None
                if tab == 'id':
                    out = result['id']
                elif tab == 'secret':
                    out = result['secret']
                elif tab == 'name':
                    out = result['name']
                elif tab in result['attr']:
                    out = result['attr'][tab]

                if out:
                    sys.stdout.write(str(out))

        if not self.no_newline:
            print

        return True

    def create(self):
        ''' Create a new keyring item.

        Return True if item created successfully, False otherwise.
        '''

        try:
            id = gk.item_create_sync(self.keyring, self.item_type, self.name,
                                     self.params, self.secret, False)
        except gk.Error, e:
            print >>sys.stderr, 'Error creating keyring item!\nDetails:\n%s'%e
            return False

        print id

        return True

    def delete(self):
        ''' Delete a keyring item.

        Return True if item created successfully, False otherwise.
        '''

        try:
            gk.item_delete_sync(self.keyring, self.id)
        except gk.Error, e:
            print >>sys.stderr, 'Error deleting keyring item!\nDetails:\n%s'%e
            return False

        return True


class MyOptionParser(optparse.OptionParser):
    '''Overridden OptionParser not to format description and epilog, because
    the native formatting does not respect newlines.
    '''
    def format_description(self, formatter):
        return (self.get_description() or '') + '\n'

    def format_epilog(self, formatter):
        return '\n' + (self.epilog or '') + '\n'


def main():
    '''Main program loop'''
    try:
        c = CLI()
        c.execute()
    except KeyboardInterrupt:
        print 'Interrupted, exiting...'
        sys.exit(1)


if __name__ == '__main__':
    main()

