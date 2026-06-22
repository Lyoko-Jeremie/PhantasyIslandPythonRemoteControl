import setuptools
import os

# https://stackoverflow.com/questions/26900328/install-dependencies-from-setup-py
theLibFolder = os.path.dirname(os.path.realpath(__file__))
requirementPath = theLibFolder + '/requirements.txt'
install_requires = []  # Here we'll get: ["gunicorn", "docutils>=0.3", "lxml==0.5a7"]
if os.path.isfile(requirementPath):
    with open(requirementPath) as f:
        install_requires = f.read().splitlines()

setuptools.setup(
    name="PhantasyIslandPythonRemoteControl",
    version="0.6.0",
    description="Python Remote Control Tools for PhantasyIsland",
    # https://stackoverflow.com/questions/51286928/what-is-where-argument-for-in-setuptools-find-packages
    # DO NOT pack mock/test (like js) into output
    packages=setuptools.find_packages(where='src'),
    # special the root
    package_dir={
        '': 'src',
    },
    classifiers=[
    ],
    # install_requires=install_requires,
    install_requires=[
        'requests>=2.27.1',
    ],
    extras={
        'numpy>=1.22.3',
        "opencv-python>=4.5.5",
        "opencv-contrib-python>=4.5.5",
        "opencv-contrib-python-headless>=>=4.5.5",
        "opencv-python-headless>=4.5.5",
    },
    author='Jeremie',
    author_email='lucheng989898@protonmail.com',
    python_requires='>=3.8',
)

# pip install mypy
# mypy src/PhantasyIslandPythonRemoteControl/__init__.py
# stubgen src/PhantasyIslandPythonRemoteControl/

# <del> pip install wheel </del>
# <del> python setup.py bdist_wheel </del>

# https://blog.ganssle.io/articles/2021/10/setup-py-deprecated.html
# pip install build
# python -m build
