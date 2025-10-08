import os, sys
sys.path.append(os.path.abspath(os.getcwd()))
from studybar.api.job_store import create_job, get_job, update_status, DB_PATH


def test_job_lifecycle(tmp_path):
    # Use a temp DB path
    db_dir = tmp_path / "data"
    db_dir.mkdir()
    os.environ['JOB_STORE_PATH'] = str(db_dir / 'job_store.sqlite')

    job_id = 'testjob123'
    pdf_path = '/tmp/fake.pdf'
    create_job(job_id, pdf_path)
    j = get_job(job_id)
    assert j is not None
    assert j['status'] == 'pending'
    update_status(job_id, 'processing')
    j2 = get_job(job_id)
    assert j2['status'] == 'processing'
    update_status(job_id, 'done', result=[{'id':'1','front':'a','back':'b'}])
    j3 = get_job(job_id)
    assert j3['status'] == 'done'
    assert isinstance(j3['result'], list)
